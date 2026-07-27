import type { COGSSummary } from '@reyogo/types';

function isCategoryName(name: string | null): name is string {
  return name !== null;
}

export function availableCategoriesOf(cogs: COGSSummary): string[] {
  return cogs.byCategory
    .map((row) => row.categoryName)
    .filter(isCategoryName)
    .sort();
}
