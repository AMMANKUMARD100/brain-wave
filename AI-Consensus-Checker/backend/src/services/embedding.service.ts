import { logger } from '../utils/logger';
import { PythonEmbeddingProvider } from './pythonEmbeddingProvider';
import type { EmbeddingProvider, EmbeddingMetadata, EmbeddingVector } from '../interfaces/embeddingProvider';

const EMBEDDING_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';
const MAX_CHARS_PER_CHUNK = 1800;
const DEFAULT_TIMEOUT_MS = 30_000;

let provider: EmbeddingProvider | null = null;
let providerOverride: EmbeddingProvider | null = null;

function chunkText(text: string): string[] {
  const normalized = text.trim();
  if (normalized.length <= MAX_CHARS_PER_CHUNK) {
    return [normalized];
  }

  const segments: string[] = [];
  let remaining = normalized;

  while (remaining.length > 0) {
    if (remaining.length <= MAX_CHARS_PER_CHUNK) {
      segments.push(remaining);
      break;
    }

    let segment = remaining.slice(0, MAX_CHARS_PER_CHUNK);
    const lastSpace = segment.lastIndexOf(' ');
    if (lastSpace > 100) {
      segment = segment.slice(0, lastSpace);
    }

    segments.push(segment);
    remaining = remaining.slice(segment.length).trim();
  }

  return segments;
}

function averageAndNormalize(vectors: EmbeddingVector[]): EmbeddingVector {
  const length = vectors[0].length;
  const result = new Array<number>(length).fill(0);

  for (const vector of vectors) {
    for (let i = 0; i < length; i += 1) {
      result[i] += vector[i];
    }
  }

  const scale = 1 / vectors.length;
  let magnitude = 0;

  for (let i = 0; i < length; i += 1) {
    result[i] *= scale;
    magnitude += result[i] * result[i];
  }

  magnitude = Math.sqrt(magnitude) || 1;
  return result.map((value) => value / magnitude);
}

function createEmbeddingMetadata(index: number, chunkCount: number, vectorLength: number): EmbeddingMetadata {
  return {
    id: `embed-${Date.now()}-${index}`,
    modelName: EMBEDDING_MODEL,
    chunkCount,
    vectorLength,
    createdAt: new Date().toISOString(),
  };
}

export function setEmbeddingProvider(testProvider: EmbeddingProvider | null): void {
  providerOverride = testProvider;
}

async function getProvider(): Promise<EmbeddingProvider> {
  if (providerOverride) {
    return providerOverride;
  }

  if (provider) {
    return provider;
  }

  provider = new PythonEmbeddingProvider();
  logger.info(`Embedding provider loaded: ${EMBEDDING_MODEL}`);
  return provider;
}

export interface EmbeddingResult {
  metadata: EmbeddingMetadata;
  vector: EmbeddingVector;
}

export async function generateAnswerEmbeddings(answers: string[], timeoutMs = DEFAULT_TIMEOUT_MS): Promise<EmbeddingResult[]> {
  if (!Array.isArray(answers) || answers.length !== 5) {
    throw new Error('Embedding service requires exactly five answer strings.');
  }

  const providerInstance = await getProvider();
  const chunksByAnswer = answers.map(chunkText);
  const flattenedChunks = chunksByAnswer.flat();

  if (flattenedChunks.length === 0) {
    throw new Error('No text available to embed.');
  }

  try {
    const vectors = await providerInstance.generateEmbeddings(flattenedChunks, timeoutMs);
    if (!Array.isArray(vectors) || vectors.length !== flattenedChunks.length) {
      throw new Error('Invalid embedding response from provider.');
    }

    const results: EmbeddingResult[] = [];
    let cursor = 0;

    for (let i = 0; i < chunksByAnswer.length; i += 1) {
      const chunks = chunksByAnswer[i];
      const embeddings = vectors.slice(cursor, cursor + chunks.length);
      cursor += chunks.length;

      if (embeddings.length !== chunks.length) {
        throw new Error('Failed to align embeddings with text chunks.');
      }

      const averagedVector = averageAndNormalize(embeddings);
      results.push({
        metadata: createEmbeddingMetadata(i, chunks.length, averagedVector.length),
        vector: averagedVector,
      });
    }

    return results;
  } catch (error) {
    logger.error(
      `Embedding generation failed: ${error instanceof Error ? error.message : String(error)}`,
      { timeout: timeoutMs, chunkCount: flattenedChunks.length },
    );
    throw error;
  }
}
