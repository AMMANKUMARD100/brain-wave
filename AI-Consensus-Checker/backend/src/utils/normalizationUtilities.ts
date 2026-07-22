export function normalizeToPercentage(value: number): number {
  const normalized = Math.max(0, Math.min(100, value));
  return Number(normalized.toFixed(2));
}

export function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}
