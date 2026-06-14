import type { Stats } from '../../../../types';

export function uomPartOf(stats: Stats): string {
  if (!stats.uom) return '';
  return ` · ${stats.uom}`;
}
