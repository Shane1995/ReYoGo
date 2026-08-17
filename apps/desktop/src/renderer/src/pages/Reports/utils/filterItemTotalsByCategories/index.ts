import type { ItemTotalRow } from '../itemTotalRowsOf/types';

function matchesSelection(categoryName: string | undefined, selected: string[]): boolean {
  return categoryName !== undefined && selected.includes(categoryName);
}

export function filterItemTotalsByCategories(
  rows: ItemTotalRow[],
  selected: string[],
): ItemTotalRow[] {
  if (selected.length === 0) return rows;
  return rows.filter((row) => matchesSelection(row.categoryName, selected));
}
