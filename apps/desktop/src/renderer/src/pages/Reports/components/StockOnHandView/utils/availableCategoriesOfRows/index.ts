import type { StockLevelRow } from '../../../../hooks/useStockLevelRows/types';

export function availableCategoriesOfRows(rows: StockLevelRow[]): string[] {
  const seen = new Set<string>();
  for (const row of rows) {
    if (row.categoryName) seen.add(row.categoryName);
  }
  return Array.from(seen).sort();
}
