export function changeLabelOf(change: number | null): string {
  if (change === null) return '—';
  return `${change.toFixed(1)}%`;
}
