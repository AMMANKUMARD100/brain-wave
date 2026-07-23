import type { ConsensusCluster } from '../../../backend/src/types/consensus';

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
    // Add embedding if needed on frontend
  }>;
  clusters: ConsensusCluster[]; // Add clusters from backend
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
  clusters?: ConsensusCluster[]; // Make optional for backward compatibility if needed
  consensus?: string; // Make optional for backward compatibility if needed
}
