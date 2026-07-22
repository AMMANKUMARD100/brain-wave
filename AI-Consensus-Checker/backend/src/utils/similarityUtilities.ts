export function pairwiseSimilarityStats(similarityMatrix: number[][], indices: number[]) {
  if (indices.length === 0) {
    return {
      average: 0,
      minimum: 0,
      maximum: 0,
      variance: 0,
      pairCount: 0,
    };
  }

  if (indices.length === 1) {
    return {
      average: 1,
      minimum: 1,
      maximum: 1,
      variance: 0,
      pairCount: 0,
    };
  }

  const similarities: number[] = [];

  for (let i = 0; i < indices.length; i += 1) {
    for (let j = i + 1; j < indices.length; j += 1) {
      const rowIndex = indices[i];
      const colIndex = indices[j];
      similarities.push(similarityMatrix[rowIndex][colIndex]);
    }
  }

  const average = similarities.reduce((sum, value) => sum + value, 0) / similarities.length;
  const minimum = Math.min(...similarities);
  const maximum = Math.max(...similarities);
  const variance = similarities.reduce((sum, value) => sum + (value - average) ** 2, 0) / similarities.length;

  return {
    average,
    minimum,
    maximum,
    variance,
    pairCount: similarities.length,
  };
}
