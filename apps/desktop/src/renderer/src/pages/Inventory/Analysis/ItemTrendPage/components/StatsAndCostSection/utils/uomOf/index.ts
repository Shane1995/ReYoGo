import type { Stats } from '../../../../types';

export function uomOf(stats: Stats | null): string | undefined {
  if (!stats) return undefined;
  return stats.uom;
}
