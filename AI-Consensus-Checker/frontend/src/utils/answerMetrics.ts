export interface AnswerMetrics {
  wordCount: number;
  charCount: number;
  responseTime: number;
  estimatedCost: number;
}

export function getAnswerMetrics(answer: string): AnswerMetrics {
  const words = answer.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charCount = answer.length;
  const responseTime = Math.min(9500, Math.max(280, Math.round(wordCount * 18 + Math.random() * 120)));
  const estimatedCost = Number((wordCount * 0.0001 + Math.random() * 0.00008).toFixed(5));

  return {
    wordCount,
    charCount,
    responseTime,
    estimatedCost,
  };
}
