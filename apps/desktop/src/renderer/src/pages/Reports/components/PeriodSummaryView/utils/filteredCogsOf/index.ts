import type { COGSSummary } from '@reyogo/types';

function matchesSelection(categoryName: string | null, selected: string[]): boolean {
  return categoryName !== null && selected.includes(categoryName);
}

export function filteredCogsOf(cogs: COGSSummary, selectedCategories: string[]): COGSSummary {
  if (selectedCategories.length === 0) return cogs;
  const byCategory = cogs.byCategory.filter((row) =>
    matchesSelection(row.categoryName, selectedCategories),
  );
  const total = byCategory.reduce((sum, row) => sum + row.total, 0);
  return { total, byCategory };
}
