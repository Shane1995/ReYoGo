import type { ItemTotalRow } from '../itemTotalRowsOf/types';

export function grandItemTotalOf(rows: ItemTotalRow[]): number {
  return rows.reduce((sum, row) => sum + row.totalValue, 0);
}
