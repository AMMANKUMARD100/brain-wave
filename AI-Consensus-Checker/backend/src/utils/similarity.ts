import type { Vector } from './math';
import { dotProduct, magnitude } from './math';

export function cosineSimilarity(a: Vector, b: Vector): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have equal length to compute cosine similarity.');
  }

  const denominator = magnitude(a) * magnitude(b);
  if (denominator === 0) {
    return 0;
  }

  return dotProduct(a, b) / denominator;
}

export function buildSimilarityMatrix(vectors: Vector[]): number[][] {
  const length = vectors.length;
  const matrix: number[][] = Array.from({ length }, () => new Array<number>(length).fill(0));

  for (let i = 0; i < length; i += 1) {
    matrix[i][i] = 1;
    for (let j = i + 1; j < length; j += 1) {
      const similarity = cosineSimilarity(vectors[i], vectors[j]);
      matrix[i][j] = similarity;
      matrix[j][i] = similarity;
    }
  }

  return matrix;
}
