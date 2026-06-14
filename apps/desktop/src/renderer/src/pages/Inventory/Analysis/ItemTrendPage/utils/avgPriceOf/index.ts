import type { Stats } from '../../types';

export function avgPriceOf(stats: Stats | null): number {
  if (!stats) return 0;
  return stats.avg;
}
