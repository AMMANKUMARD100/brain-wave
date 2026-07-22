import type { AnswerItem } from '../types/ask';
import { clusterEmbeddings } from '../utils/clustering';
import { buildSimilarityMatrix } from '../utils/similarity';
import { normalize } from '../utils/math';
import { pairwiseSimilarityStats } from '../utils/similarityUtilities';
import { calculateConsensusScore, getConfidenceLabel } from './consensusCalculator';
import { normalizeToPercentage } from '../utils/normalizationUtilities';
import type { ConsensusCluster } from '../types/consensus';

export function buildConsensusClusters(
  responses: AnswerItem[],
  embeddings: number[][],
  threshold: number,
): ConsensusCluster[] {
  if (responses.length !== embeddings.length) {
    throw new Error('Response count must match embedding count when scoring consensus.');
  }

  if (responses.length === 0) {
    return [];
  }

  const normalizedEmbeddings = embeddings.map((embedding) => normalize(embedding));
  const similarityMatrix = buildSimilarityMatrix(normalizedEmbeddings);
  const clusterResult = clusterEmbeddings(
    responses.map((response, index) => ({
      id: response.id,
      modelName: response.model,
      answer: response.answer,
      embedding: normalizedEmbeddings[index],
    })),
    threshold,
    similarityMatrix,
  );

  const totalModels = responses.length;

  return clusterResult
    .map((cluster) => {
      const stats = pairwiseSimilarityStats(similarityMatrix, cluster.memberIndices);
      const consensusScore = calculateConsensusScore(cluster.memberIndices.length, totalModels, stats.average);
      const confidenceLabel = getConfidenceLabel(consensusScore);

      return {
        clusterId: cluster.clusterId,
        representativeId: cluster.representativeId,
        representativeAnswer: responses[cluster.representativeIndex].answer,
        memberIds: cluster.memberIds,
        members: cluster.memberIndices.map((memberIndex: number) => ({
          id: responses[memberIndex].id,
          model: responses[memberIndex].model,
          answer: responses[memberIndex].answer,
        })),
        modelCount: cluster.memberIndices.length,
        totalModels,
        averageSimilarity: Number(stats.average.toFixed(4)),
        minimumSimilarity: Number(stats.minimum.toFixed(4)),
        maximumSimilarity: Number(stats.maximum.toFixed(4)),
        variance: Number(stats.variance.toFixed(6)),
        consensusScore: normalizeToPercentage(consensusScore),
        confidenceLabel,
      };
    })
    .sort((a: ConsensusCluster, b: ConsensusCluster) => b.consensusScore - a.consensusScore);
}
