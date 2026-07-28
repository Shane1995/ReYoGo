import type { StockLevelRow } from '../../types';

export function filterRowsByType(rows: StockLevelRow[], type: string): StockLevelRow[] {
  if (!type) return rows;
  return rows.filter((row) => row.categoryType === type);
}
