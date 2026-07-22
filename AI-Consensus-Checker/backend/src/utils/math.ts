export type Vector = number[];

export function dotProduct(a: Vector, b: Vector): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have equal length for dot product.');
  }

  let total = 0;
  for (let i = 0; i < a.length; i += 1) {
    total += a[i] * b[i];
  }
  return total;
}

export function magnitude(vector: Vector): number {
  let sum = 0;
  for (let i = 0; i < vector.length; i += 1) {
    sum += vector[i] * vector[i];
  }
  return Math.sqrt(sum);
}

export function normalize(vector: Vector): Vector {
  const length = magnitude(vector);
  if (length === 0) {
    return [...vector];
  }
  return vector.map((value) => value / length);
}

export function addVectors(a: Vector, b: Vector): Vector {
  if (a.length !== b.length) {
    throw new Error('Vectors must have equal length for addition.');
  }

  return a.map((value, index) => value + b[index]);
}

export function scaleVector(vector: Vector, scalar: number): Vector {
  return vector.map((value) => value * scalar);
}
