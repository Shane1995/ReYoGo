import type { ItemTotalRow } from '../itemTotalRowsOf/types';

export function availableCategoriesOfItemTotals(rows: ItemTotalRow[]): string[] {
  const seen = new Set<string>();
  for (const row of rows) {
    if (row.categoryName) seen.add(row.categoryName);
  }
  return Array.from(seen).sort();
}
