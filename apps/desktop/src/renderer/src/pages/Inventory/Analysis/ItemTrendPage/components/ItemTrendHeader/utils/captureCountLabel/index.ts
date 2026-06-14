import type { Stats } from '../../../../types';

export function captureCountLabel(stats: Stats): string {
  if (stats.count === 1) return '1 capture';
  return `${stats.count} captures`;
}
