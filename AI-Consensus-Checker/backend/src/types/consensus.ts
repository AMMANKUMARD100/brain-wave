export type ConfidenceLabel =
  | 'Very Strong Consensus'
  | 'Strong Consensus'
  | 'Moderate Consensus'
  | 'Weak Consensus'
  | 'No Consensus';

export interface ConsensusCluster {
  clusterId: string;
  representativeId: string;
  representativeAnswer: string;
  memberIds: string[];
  members: Array<{
    id: string;
    model: string;
    answer: string;
  }>;
  modelCount: number;
  totalModels: number;
  averageSimilarity: number;
  minimumSimilarity: number;
  maximumSimilarity: number;
  variance: number;
  consensusScore: number;
  confidenceLabel: ConfidenceLabel;
}
