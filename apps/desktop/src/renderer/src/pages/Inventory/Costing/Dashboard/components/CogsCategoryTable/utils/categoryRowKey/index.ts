import type { COGSSummary } from '@reyogo/types';

export function categoryRowKey(row: COGSSummary['byCategory'][number], i: number): string | number {
  return row.categoryId ?? i;
}
