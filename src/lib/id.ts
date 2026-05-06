export function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createRedemptionCode(): string {
  return `TC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
