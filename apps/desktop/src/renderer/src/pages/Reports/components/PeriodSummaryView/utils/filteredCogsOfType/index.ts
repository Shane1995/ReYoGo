import type { COGSSummary } from '@reyogo/types';
import type { InventoryCategory } from '@/pages/Inventory/Capture/CapturedInventory/types';

export function filteredCogsOfType(
  cogs: COGSSummary,
  categories: InventoryCategory[],
  type: string,
): COGSSummary {
  if (!type) return cogs;
  const typeByCategoryId = new Map(categories.map((category) => [category.id, category.type]));
  const byCategory = cogs.byCategory.filter(
    (row) => row.categoryId !== null && typeByCategoryId.get(row.categoryId) === type,
  );
  const total = byCategory.reduce((sum, row) => sum + row.total, 0);
  return { total, byCategory };
}
