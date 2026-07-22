import { buildConsensusClusters } from '../consensus.service';
import type { AnswerItem } from '../../types/ask';

describe('Consensus Service', () => {
  const baseResponses: AnswerItem[] = [
    { id: 'model-a', model: 'Model A', answer: 'Answer A', similarity: 0.95 },
    { id: 'model-b', model: 'Model B', answer: 'Answer B', similarity: 0.92 },
    { id: 'model-c', model: 'Model C', answer: 'Answer C', similarity: 0.88 },
    { id: 'model-d', model: 'Model D', answer: 'Answer D', similarity: 0.85 },
    { id: 'model-e', model: 'Model E', answer: 'Answer E', similarity: 0.80 },
  ];

  it('computes a perfect consensus for a single cluster of identical embeddings', () => {
    const identicalEmbeddings = Array.from({ length: 5 }, () => [1, 0, 0]);
    const clusters = buildConsensusClusters(baseResponses, identicalEmbeddings, 0.9);

    expect(clusters).toHaveLength(1);
    expect(clusters[0].modelCount).toBe(5);
    expect(clusters[0].averageSimilarity).toBeCloseTo(1, 4);
    expect(clusters[0].consensusScore).toBe(100);
    expect(clusters[0].confidenceLabel).toBe('Very Strong Consensus');
  });

  it('returns five separate clusters when all answers are semantically distinct', () => {
    const orthogonalEmbeddings = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
      [0.0, 0.0, 0.0],
      [0.5, -0.5, 0.5],
    ];

    const clusters = buildConsensusClusters(baseResponses, orthogonalEmbeddings, 0.99);

    expect(clusters).toHaveLength(5);
    clusters.forEach((cluster) => {
      expect(cluster.modelCount).toBe(1);
      expect(cluster.consensusScore).toBe(20);
      expect(cluster.confidenceLabel).toBe('No Consensus');
    });
  });

  it('handles identical answers with strong similarity using one cluster', () => {
    const similarEmbeddings = [
      [1, 0, 0],
      [0.98, 0.06, 0],
      [0.97, 0.08, 0],
      [0.99, 0.02, 0],
      [0.96, 0.1, 0],
    ];

    const clusters = buildConsensusClusters(baseResponses, similarEmbeddings, 0.85);

    expect(clusters).toHaveLength(1);
    expect(clusters[0].averageSimilarity).toBeGreaterThan(0.9);
    expect(clusters[0].consensusScore).toBeGreaterThanOrEqual(90);
    expect(clusters[0].confidenceLabel).toBe('Very Strong Consensus');
  });

  it('uses one failed provider as a normal cluster member when embedding is provided', () => {
    const responsesWithFailure: AnswerItem[] = [
      ...baseResponses.slice(0, 4),
      { id: 'model-failed', model: 'Failing Model', answer: 'No answer available', similarity: 0 },
    ];

    const embeddings = [
      [1, 0, 0],
      [0.99, 0.01, 0],
      [0.98, 0.02, 0],
      [0.97, 0.03, 0],
      [0.1, 0.99, 0],
    ];

    const clusters = buildConsensusClusters(responsesWithFailure, embeddings, 0.9);

    expect(clusters).toHaveLength(2);
    expect(clusters[0].modelCount).toBe(4);
    expect(clusters[0].confidenceLabel).toBe('Strong Consensus');
    expect(clusters[1].modelCount).toBe(1);
    expect(clusters[1].confidenceLabel).toBe('No Consensus');
  });
});
