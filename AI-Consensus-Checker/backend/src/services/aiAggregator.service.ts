import { ProviderName, createProvider } from './providerFactory';
import type { ProviderResponse } from '../interfaces/aiService';
import { logger } from '../utils/logger'; // Assuming the enhanced logger is in this path
import { env } from '../config/env';

const providers = [
  ProviderName.GoogleGemini,
  ProviderName.Groq,
  ProviderName.OpenRouter,
  ProviderName.Cerebras,
  ProviderName.TogetherAI,
];

const MAX_RETRIES = env.PROVIDER_MAX_RETRIES || 1; // Configurable retries
const TIMEOUT_MS = env.PROVIDER_TIMEOUT_MS || 15000; // Configurable timeout

async function executeProvider(providerName: ProviderName, question: string, abortSignal: AbortSignal): Promise<ProviderResponse> {
  const service = createProvider(providerName);
  let attempts = 0;
  let lastResponse: ProviderResponse | null = null;

  while (attempts <= MAX_RETRIES) {
    attempts++;
    try {
      // Pass the abortSignal to the service if it supports it
      // This requires modification in individual provider services to accept AbortSignal
      // For now, we'll rely on axios timeout or similar mechanisms within the provider
      const response = await Promise.race([
        service.generateAnswer(question),
        new Promise<ProviderResponse>((_, reject) => {
          abortSignal.addEventListener("abort", () => {
            reject(new Error(`Provider ${providerName} timed out after ${TIMEOUT_MS}ms`));
          });
        }),
      ]);

      if (response.status === 'success') {
        return response;
      } else {
        lastResponse = response;
        logger.warn(`Provider ${service.providerName} failed on attempt ${attempts}: ${response.errorMessage}`, { providerName: service.providerName, attempt: attempts });
      }
    } catch (error: any) {
      lastResponse = {
        modelName: service.providerName,
        answer: '',
        responseTime: 0,
        estimatedCost: 0,
        status: 'error',
        errorMessage: error.message || 'Unknown error during provider execution',
      };
      logger.error(`Provider ${service.providerName} threw an error on attempt ${attempts}: ${error.message}`, error, { providerName: service.providerName, attempt: attempts });
    }

    if (attempts <= MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, 100 * attempts)); // Exponential backoff
    }
  }

  return lastResponse || {
    modelName: providerName,
    answer: '',
    responseTime: 0,
    estimatedCost: 0,
    status: 'error',
    errorMessage: `Provider ${providerName} failed after ${MAX_RETRIES + 1} attempts.`,
  };
}

export async function gatherAnswers(question: string): Promise<ProviderResponse[]> {
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => {
    logger.warn(`Global timeout triggered for question: ${question}`);
    abortController.abort();
  }, TIMEOUT_MS);

  try {
    const providerPromises = providers.map((provider) =>
      executeProvider(provider, question, abortController.signal)
    );

    const settled = await Promise.allSettled(providerPromises);

    return settled.map((result) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        // This case should ideally be handled by executeProvider's retry logic
        // but as a fallback, we log and return a structured error
        logger.error(`Provider promise rejected unexpectedly: ${result.reason.message}`, result.reason);
        return {
          modelName: 'Unknown',
          answer: '',
          responseTime: 0,
          estimatedCost: 0,
          status: 'error',
          errorMessage: result.reason.message || 'Unknown error during provider aggregation',
        };
      }
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
