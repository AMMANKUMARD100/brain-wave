export interface EmbeddingMetadata {
  id: string;
  modelName: string;
  chunkCount: number;
  vectorLength: number;
  createdAt: string;
}

export interface AnswerItem {
  id: string;
  model: string;
  answer: string;
  similarity: number;
  embedding?: EmbeddingMetadata;
}

import type { ConsensusCluster } from './consensus';

export interface QuestionResponse {
  question: string;
  status: 'success' | 'error';
  consensus: string;
  responses: AnswerItem[];
  clusters: ConsensusCluster[];
  message?: string;
  submittedAt: string;
}
