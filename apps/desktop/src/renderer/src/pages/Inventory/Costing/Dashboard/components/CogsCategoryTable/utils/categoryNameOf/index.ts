import type { COGSSummary } from '@reyogo/types';

export function categoryNameOf(row: COGSSummary['byCategory'][number]): string {
  return row.categoryName ?? 'Uncategorised';
}
