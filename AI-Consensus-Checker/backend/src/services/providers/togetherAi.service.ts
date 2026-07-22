import axios from 'axios';
import type { AIService, ProviderResponse } from '../../interfaces/aiService';

const endpoint = process.env.TOGETHER_AI_ENDPOINT;
const apiKey = process.env.TOGETHER_AI_API_KEY;

function estimateCost(durationMs: number): number {
  return Number((0.00011 * durationMs).toFixed(5));
}

export class TogetherAIService implements AIService {
  providerName = 'Together AI';

  async generateAnswer(question: string): Promise<ProviderResponse> {
    const start = Date.now();

    if (!endpoint || !apiKey) {
      return {
        modelName: this.providerName,
        answer: '',
        responseTime: 0,
        estimatedCost: 0,
        status: 'error',
        errorMessage: 'Missing Together AI configuration',
      };
    }

    try {
      const response = await axios.post(
        endpoint,
        { prompt: question },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        },
      );

      const responseTime = Date.now() - start;
      return {
        modelName: this.providerName,
        answer: response.data?.text ?? 'No answer returned',
        responseTime,
        estimatedCost: estimateCost(responseTime),
        status: 'success',
      };
    } catch (error) {
      const responseTime = Date.now() - start;
      return {
        modelName: this.providerName,
        answer: '',
        responseTime,
        estimatedCost: estimateCost(responseTime),
        status: 'error',
        errorMessage: axios.isAxiosError(error) && error.code === 'ECONNABORTED' ? 'Request timed out' : 'Provider request failed',
      };
    }
  }
}
