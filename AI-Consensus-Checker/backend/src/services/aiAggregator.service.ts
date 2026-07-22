import { ProviderName, createProvider } from './providerFactory';
import type { ProviderResponse } from '../interfaces/aiService';
import { logger } from '../utils/logger';

const providers = [
  ProviderName.GoogleGemini,
  ProviderName.Groq,
  ProviderName.OpenRouter,
  ProviderName.Cerebras,
  ProviderName.TogetherAI,
];

const MAX_RETRIES = 2;
const TIMEOUT_MS = 12000;

async function executeProvider(providerName: ProviderName, question: string): Promise<ProviderResponse> {
  const service = createProvider(providerName);
  let response = await service.generateAnswer(question);

  if (response.status === 'error' && MAX_RETRIES > 0) {
    logger.error(`Retrying provider ${service.providerName} after failure: ${response.errorMessage}`);
    await new Promise(resolve => setTimeout(resolve, 100));
    response = await service.generateAnswer(question);
    if (response.status === 'error') {
      logger.error(`Provider ${service.providerName} failed again: ${response.errorMessage}`);
    }
  }

  return response;
}

export async function gatherAnswers(question: string): Promise<ProviderResponse[]> {
  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), TIMEOUT_MS);

  try {
    const settled = await Promise.allSettled(
      providers.map((provider) => executeProvider(provider, question))
    );
    clearTimeout(timeout);

    return settled.map((result) => {
      if (result.status === 'fulfilled') {
        return result.value;
      }

      logger.error(`Provider task rejected unexpectedly: ${(result.reason as Error).message}`);
      return {
        modelName: 'Unknown',
        answer: '',
        responseTime: 0,
        estimatedCost: 0,
        status: 'error' as const,
        errorMessage: (result.reason as Error)?.message,
      };
    });
  } finally {
    clearTimeout(timeout);
  }
}
