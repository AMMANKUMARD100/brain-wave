import axios from 'axios';
import type { AIService, ProviderResponse } from '../../interfaces/aiService';

const endpoint = process.env.GOOGLE_GEMINI_ENDPOINT;
const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

function estimateCost(durationMs: number): number {
  return Number((0.00015 * durationMs).toFixed(5));
}

export class GoogleGeminiService implements AIService {
  providerName = 'Google Gemini';

  async generateAnswer(question: string): Promise<ProviderResponse> {
    const start = Date.now();

    if (!endpoint || !apiKey) {
      return {
        modelName: this.providerName,
        answer: '',
        responseTime: 0,
        estimatedCost: 0,
        status: 'error',
        errorMessage: 'Missing Google Gemini configuration',
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
        answer: response.data?.output ?? 'No answer returned',
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
