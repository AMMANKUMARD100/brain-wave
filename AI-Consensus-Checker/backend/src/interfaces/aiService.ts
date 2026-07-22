export type ProviderStatus = 'success' | 'error' | 'timeout';

export interface ProviderResponse {
  modelName: string;
  answer: string;
  responseTime: number;
  estimatedCost: number;
  status: ProviderStatus;
  errorMessage?: string;
}

export interface AIService {
  providerName: string;
  generateAnswer(question: string): Promise<ProviderResponse>;
}
