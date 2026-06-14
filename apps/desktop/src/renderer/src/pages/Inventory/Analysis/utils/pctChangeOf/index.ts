export function pctChangeOf(current: number, prev: number | null): number | null {
  if (prev === null) return null;
  if (prev <= 0) return null;
  return ((current - prev) / prev) * 100;
}
