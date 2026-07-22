import type { ConfidenceLabel } from '../types/consensus';

export function calculateConsensusScore(clusterSize: number, totalModels: number, averageSimilarity: number): number {
  if (totalModels <= 0 || clusterSize <= 0) {
    return 0;
  }

  const rawScore = (clusterSize / totalModels) * averageSimilarity * 100;
  return Math.max(0, Math.min(100, Number(rawScore.toFixed(2))));
}

export function getConfidenceLabel(score: number): ConfidenceLabel {
  if (score >= 90) {
    return 'Very Strong Consensus';
  }

  if (score >= 75) {
    return 'Strong Consensus';
  }

  if (score >= 60) {
    return 'Moderate Consensus';
  }

  if (score >= 40) {
    return 'Weak Consensus';
  }

  return 'No Consensus';
}
