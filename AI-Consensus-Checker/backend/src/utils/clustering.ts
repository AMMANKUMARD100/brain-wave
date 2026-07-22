import type { Vector } from './math';
import { addVectors, scaleVector } from './math';
import { cosineSimilarity, buildSimilarityMatrix } from './similarity';
import type { ClusterMetadata } from '../types/cluster';

export interface ClusterInputItem {
  id: string;
  modelName: string;
  answer: string;
  embedding: Vector;
}

export interface ClusterResult {
  clusterId: string;
  memberIds: string[];
  memberIndices: number[];
  representativeId: string;
  representativeIndex: number;
  averageSimilarity: number;
  modelCount: number;
  consensusPercentage: number;
}

function computeCentroid(vectors: Vector[]): Vector {
  const length = vectors[0].length;
  let sum = new Array<number>(length).fill(0);
  for (const vector of vectors) {
    sum = addVectors(sum, vector);
  }
  return scaleVector(sum, 1 / vectors.length);
}

export function clusterEmbeddings(
  items: ClusterInputItem[],
  threshold: number,
  similarityMatrix?: number[][],
): ClusterResult[] {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  const normalizedItems = items.map((item) => ({
    ...item,
    embedding: item.embedding.map((value) => value / Math.sqrt(item.embedding.reduce((sum, x) => sum + x * x, 0) || 1)),
  }));

  const matrix = similarityMatrix ?? buildSimilarityMatrix(normalizedItems.map((item) => item.embedding));
  const visited = new Set<number>();
  const clusters: ClusterResult[] = [];

  for (let i = 0; i < normalizedItems.length; i += 1) {
    if (visited.has(i)) continue;

    const group = [i];
    visited.add(i);

    for (let j = i + 1; j < normalizedItems.length; j += 1) {
      if (visited.has(j)) continue;
      if (matrix[i][j] >= threshold) {
        group.push(j);
        visited.add(j);
      }
    }

    const groupVectors = group.map((index) => normalizedItems[index].embedding);
    const centroid = computeCentroid(groupVectors);
    const representativeIndex = group.reduce((closest, current) => {
      const closestSimilarity = cosineSimilarity(normalizedItems[closest].embedding, centroid);
      const currentSimilarity = cosineSimilarity(normalizedItems[current].embedding, centroid);
      return currentSimilarity > closestSimilarity ? current : closest;
    }, group[0]);

    let averageSimilarity = 0;
    if (group.length > 1) {
      let similaritySum = 0;
      let comparisonCount = 0;

      for (let m = 0; m < group.length; m += 1) {
        for (let n = m + 1; n < group.length; n += 1) {
          similaritySum += matrix[group[m]][group[n]];
          comparisonCount += 1;
        }
      }

      averageSimilarity = comparisonCount === 0 ? 0 : similaritySum / comparisonCount;
    } else {
      averageSimilarity = 1;
    }

    clusters.push({
      clusterId: `cluster-${i}`,
      memberIds: group.map((index) => normalizedItems[index].id),
      memberIndices: group,
      representativeId: normalizedItems[representativeIndex].id,
      representativeIndex,
      averageSimilarity,
      modelCount: group.length,
      consensusPercentage: Number(((group.length / items.length) * 100).toFixed(2)),
    });
  }

  return clusters;
}
