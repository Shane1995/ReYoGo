import type { StockLevelRow } from '../../types';

export function grandTotalOf(rows: StockLevelRow[]): number {
  return rows.reduce((sum, row) => sum + row.totalValue, 0);
}
