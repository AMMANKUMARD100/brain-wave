import type { AnswerItem } from '../types/ask';
import { clusterEmbeddings } from '../utils/clustering';
import type { ClusterMetadata } from '../types/cluster';

export function buildResponseClusters(
  responses: AnswerItem[],
  embeddings: number[][],
  threshold: number,
): ClusterMetadata[] {
  if (responses.length !== embeddings.length) {
    throw new Error('Response count must match embedding count when clustering.');
  }

  if (responses.length === 0) {
    return [];
  }

  return clusterEmbeddings(
    responses.map((response, index) => ({
      id: response.id,
      modelName: response.model,
      answer: response.answer,
      embedding: embeddings[index],
    })),
    threshold,
  );
}
