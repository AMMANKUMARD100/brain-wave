import { buildResponseClusters } from '../clustering.service';
import type { AnswerItem } from '../../types/ask';

describe('Clustering Service', () => {
  it('clusters responses by cosine similarity threshold', () => {
    const responses: AnswerItem[] = [
      { id: 'r1', model: 'Model A', answer: 'Hello world', similarity: 0.95 },
      { id: 'r2', model: 'Model B', answer: 'Hello world', similarity: 0.92 },
      { id: 'r3', model: 'Model C', answer: 'Goodbye world', similarity: 0.88 },
    ];

    const embeddings = [
      [1, 0, 0],
      [0.96, 0.08, 0],
      [0, 1, 0],
    ];

    const clusters = buildResponseClusters(responses, embeddings, 0.8);

    expect(clusters).toHaveLength(2);
    expect(clusters[0].memberIds).toEqual(expect.arrayContaining(['r1', 'r2']));
    expect(clusters[1].memberIds).toEqual(['r3']);
    expect(clusters[0].consensusPercentage).toBeCloseTo(66.67, 2);
    expect(clusters[1].consensusPercentage).toBeCloseTo(33.33, 2);
  });

  it('returns empty clusters when there are no responses', () => {
    const clusters = buildResponseClusters([], [], 0.8);
    expect(clusters).toEqual([]);
  });
});
