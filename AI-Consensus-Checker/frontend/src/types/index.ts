export interface AppConfig {
  apiBaseUrl: string;
}

export interface QuestionRequest {
  question: string;
}

export interface QuestionResponse {
  question: string;
  status: 'success' | 'error';
  consensus: string;
  responses: Array<{
    id: string;
    model: string;
    answer: string;
    similarity: number;
  }>;
  message?: string;
  submittedAt: string;
}

export type SessionStatus = 'success' | 'error';

export interface CompareSessionProvider {
  providerId: string;
  providerName: string;
  modelName: string;
  status: SessionStatus;
  responseTime: number;
  answer: string;
  timestamp: string;
}

export interface CompareSession {
  version: number;
  question: string;
  createdAt: string;
  expiresAt: string;
  providers: CompareSessionProvider[];
}
