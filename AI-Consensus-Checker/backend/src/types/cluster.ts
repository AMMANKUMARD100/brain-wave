export interface ClusterMetadata {
  clusterId: string;
  memberIds: string[];
  representativeId: string;
  averageSimilarity: number;
  modelCount: number;
  consensusPercentage: number;
}
