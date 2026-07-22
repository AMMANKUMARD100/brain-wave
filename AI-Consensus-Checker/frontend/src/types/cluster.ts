export interface ClusterMember {
  id: string;
  model: string;
  answer: string;
}

export interface ConsensusCluster {
  clusterId: string;
  clusterLabel: string;
  representativeAnswer: string;
  representativeId: string;
  representativeModel: string;
  members: ClusterMember[];
  modelCount: number;
  averageSimilarity: number;
  minimumSimilarity: number;
  maximumSimilarity: number;
  variance: number;
  consensusScore: number;
  confidenceLabel: string;
  explanation: string;
}
