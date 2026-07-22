import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import readline from 'readline';
import path from 'path';
import { logger } from '../utils/logger';
import type { EmbeddingProvider, EmbeddingVector } from '../interfaces/embeddingProvider';

const PYTHON_SCRIPT = path.resolve(__dirname, '../python/embeddings.py');
const EMBEDDING_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';
const DEFAULT_TIMEOUT_MS = 30_000;

interface PendingRequest {
  resolve: (value: EmbeddingVector[]) => void;
  reject: (reason?: unknown) => void;
  timer: NodeJS.Timeout;
}

export class PythonEmbeddingProvider implements EmbeddingProvider {
  modelName = EMBEDDING_MODEL;
  private process: ChildProcessWithoutNullStreams;
  private nextRequestId = 1;
  private pending = new Map<number, PendingRequest>();

  constructor() {
    logger.info('Starting Python embedding worker...');
    this.process = spawn('python', [PYTHON_SCRIPT, EMBEDDING_MODEL], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const stdoutReader = readline.createInterface({ input: this.process.stdout });
    stdoutReader.on('line', (line) => this.handleResponse(line));

    this.process.stderr.on('data', (chunk) => {
      logger.error(`Embedding worker stderr: ${chunk.toString().trim()}`);
    });

    this.process.on('exit', (code, signal) => {
      logger.error(`Python embedding worker exited with code=${code} signal=${signal}`);
      for (const pending of this.pending.values()) {
        pending.reject(new Error('Embedding worker terminated unexpectedly.'));
        clearTimeout(pending.timer);
      }
      this.pending.clear();
    });
  }

  private handleResponse(line: string) {
    let payload: unknown;
    try {
      payload = JSON.parse(line);
    } catch (error) {
      logger.error(`Failed to parse embedding response: ${error}`);
      return;
    }

    if (typeof payload !== 'object' || payload === null) {
      logger.error('Unexpected embedding response payload.');
      return;
    }

    const requestId = (payload as Record<string, unknown>).requestId;
    const embeddings = (payload as Record<string, unknown>).embeddings;
    if (typeof requestId !== 'number' || !Array.isArray(embeddings)) {
      logger.error('Invalid embedding response shape.');
      return;
    }

    const pending = this.pending.get(requestId);
    if (!pending) {
      logger.error(`No pending embedding request found for id ${requestId}.`);
      return;
    }

    clearTimeout(pending.timer);
    this.pending.delete(requestId);

    if (!embeddings.every((item) => Array.isArray(item) && item.every((value) => typeof value === 'number'))) {
      pending.reject(new Error('Embedding result is malformed.'));
      return;
    }

    pending.resolve(embeddings as EmbeddingVector[]);
  }

  async generateEmbeddings(texts: string[], timeoutMs = DEFAULT_TIMEOUT_MS): Promise<EmbeddingVector[]> {
    const requestId = this.nextRequestId++;
    const request = { requestId, texts };

    const serialized = `${JSON.stringify(request)}\n`;
    this.process.stdin.write(serialized);

    return new Promise<EmbeddingVector[]>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(requestId);
        reject(new Error('Embedding generation timed out.'));
      }, timeoutMs);

      this.pending.set(requestId, { resolve, reject, timer });
    });
  }
}
