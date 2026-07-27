import type { StockLevelRow } from '../../../../hooks/useStockLevelRows/types';

function matchesSelection(categoryName: string | undefined, selected: string[]): boolean {
  return categoryName !== undefined && selected.includes(categoryName);
}

export function filterRowsByCategories(rows: StockLevelRow[], selected: string[]): StockLevelRow[] {
  if (selected.length === 0) return rows;
  return rows.filter((row) => matchesSelection(row.categoryName, selected));
}
