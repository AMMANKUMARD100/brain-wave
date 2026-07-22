export type EmbeddingVector = number[];

export interface EmbeddingMetadata {
  id: string;
  modelName: string;
  chunkCount: number;
  vectorLength: number;
  createdAt: string;
}

export interface EmbeddingProvider {
  modelName: string;
  generateEmbeddings(texts: string[], timeoutMs?: number): Promise<EmbeddingVector[]>;
}
