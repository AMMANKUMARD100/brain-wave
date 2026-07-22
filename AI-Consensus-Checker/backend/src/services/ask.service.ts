import type { AnswerItem, QuestionResponse } from '../types';
import type { ProviderResponse } from '../interfaces/aiService';
import { gatherAnswers } from './aiAggregator.service';
import { logger } from '../utils/logger';
import { env } from '../config/env';
import { generateAnswerEmbeddings } from './embedding.service';
import { buildConsensusClusters } from './consensus.service';

const questionCache = new Map<string, { response: QuestionResponse; createdAt: number }>();

function calculateSimilarity(index: number, status: ProviderResponse['status']): number {
  if (status !== 'success') {
    return 0;
  }

  return Number((0.96 - index * 0.04).toFixed(2));
}

function buildConsensus(providers: ProviderResponse[]): string {
  const successful = providers.filter((provider) => provider.status === 'success');

  if (successful.length === 0) {
    return 'No consensus could be generated because all providers failed to return a valid answer.';
  }

  const uniqueAnswers = new Set(successful.map((provider) => provider.answer.trim()));
  if (uniqueAnswers.size === 1) {
    return 'All providers returned a closely aligned answer.';
  }

  return `Consensus generated from ${successful.length} provider${successful.length > 1 ? 's' : ''}. Review the individual answers to compare agreement and variance.`;
}

export async function createQuestionResponse(question: string): Promise<QuestionResponse> {
  const normalizedQuestion = question.trim();
  const cached = questionCache.get(normalizedQuestion);
  const now = Date.now();

  if (cached && now - cached.createdAt <= env.RESPONSE_CACHE_TTL_MS) {
    logger.info('Returning cached question response');
    return cached.response;
  }

  const providerResponses = await gatherAnswers(normalizedQuestion);

  const responses: AnswerItem[] = providerResponses.map((provider, index) => ({
    id: `${provider.modelName.toLowerCase().replace(/\s+/g, '-')}-${index}`,
    model: provider.modelName,
    answer: provider.status === 'success' ? provider.answer : provider.errorMessage ?? 'No answer available',
    similarity: calculateSimilarity(index, provider.status),
  }));

  let clusters = [] as ReturnType<typeof buildConsensusClusters>;

  try {
    const hasSuccess = providerResponses.some((provider) => provider.status === 'success');
    if (hasSuccess) {
      const embeddingResults = await generateAnswerEmbeddings(responses.map((item) => item.answer));
      embeddingResults.forEach((result, index) => {
        responses[index].embedding = result.metadata;
      });

      clusters = buildConsensusClusters(
        responses,
        embeddingResults.map((result) => result.vector),
        env.COSINE_SIMILARITY_THRESHOLD,
      );
    }
  } catch (error) {
    logger.error(`Embedding generation failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  const successfulCount = providerResponses.filter((provider) => provider.status === 'success').length;
  const status = successfulCount > 0 ? 'success' : 'error';
  const response: QuestionResponse = {
    question: normalizedQuestion,
    status,
    consensus: buildConsensus(providerResponses),
    responses,
    clusters,
    message: successfulCount > 0 ? 'Providers completed successfully.' : 'All providers failed to return answers.',
    submittedAt: new Date().toISOString(),
  };

  questionCache.set(normalizedQuestion, { response, createdAt: now });
  return response;
}
