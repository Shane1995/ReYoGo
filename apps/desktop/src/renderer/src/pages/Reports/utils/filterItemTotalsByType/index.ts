import type { ItemTotalRow } from '../itemTotalRowsOf/types';

export function filterItemTotalsByType(rows: ItemTotalRow[], type: string): ItemTotalRow[] {
  if (!type) return rows;
  return rows.filter((row) => row.categoryType === type);
}
