import { generateAnswerEmbeddings, setEmbeddingProvider } from '../embedding.service';
import type { EmbeddingProvider, EmbeddingVector } from '../../interfaces/embeddingProvider';

describe('Embedding Service', () => {
  const fakeProvider: EmbeddingProvider = {
    modelName: 'test-model',
    async generateEmbeddings(texts: string[]): Promise<EmbeddingVector[]> {
      return texts.map((text) => Array.from({ length: 384 }, (_, index) => index + text.length));
    },
  };

  beforeEach(() => {
    setEmbeddingProvider(fakeProvider);
  });

  afterEach(() => {
    setEmbeddingProvider(null);
  });

  it('generates metadata-only embeddings for five answers', async () => {
    const answers = ['one', 'two', 'three', 'four', 'five'];
    const results = await generateAnswerEmbeddings(answers);

    expect(results).toHaveLength(5);
    results.forEach((result, index) => {
      expect(result.metadata.id).toContain('embed-');
      expect(result.metadata.modelName).toBe('sentence-transformers/all-MiniLM-L6-v2');
      expect(result.metadata.chunkCount).toBeGreaterThanOrEqual(1);
      expect(result.metadata.vectorLength).toBe(384);
      expect(typeof result.metadata.createdAt).toBe('string');
    });
  });

  it('rejects when input is not exactly five answers', async () => {
    await expect(generateAnswerEmbeddings(['only one'])).rejects.toThrow(
      'Embedding service requires exactly five answer strings.',
    );
  });
});
