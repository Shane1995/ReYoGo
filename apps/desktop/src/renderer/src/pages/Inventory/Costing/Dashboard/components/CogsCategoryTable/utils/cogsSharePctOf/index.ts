export function cogsSharePctOf(rowTotal: number, total: number): string {
  if (total <= 0) return '—';
  return `${((rowTotal / total) * 100).toFixed(1)}%`;
}
