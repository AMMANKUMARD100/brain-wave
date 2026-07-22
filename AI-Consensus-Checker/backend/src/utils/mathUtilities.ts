export function mean(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function variance(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const average = mean(values);
  return values.reduce((total, value) => total + (value - average) ** 2, 0) / values.length;
}

export function minValue(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return Math.min(...values);
}

export function maxValue(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return Math.max(...values);
}

export function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
