import type { COGSSummary } from '@reyogo/types';

export function filteredCogsOf(cogs: COGSSummary, filterCategory: string): COGSSummary {
  if (!filterCategory) return cogs;
  const byCategory = cogs.byCategory.filter((row) => row.categoryName === filterCategory);
  const total = byCategory.reduce((sum, row) => sum + row.total, 0);
  return { total, byCategory };
}
