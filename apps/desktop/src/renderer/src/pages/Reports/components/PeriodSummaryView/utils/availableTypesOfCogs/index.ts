import type { COGSSummary } from '@reyogo/types';
import { TYPE_ORDER } from '@/pages/Inventory/Analysis/constants';
import type { InventoryCategory } from '@/pages/Inventory/Capture/CapturedInventory/types';

export function availableTypesOfCogs(cogs: COGSSummary, categories: InventoryCategory[]): string[] {
  const typeByCategoryId = new Map(categories.map((category) => [category.id, category.type]));
  const seen = new Set<string>();
  for (const row of cogs.byCategory) {
    const type = row.categoryId ? typeByCategoryId.get(row.categoryId) : undefined;
    if (type) seen.add(type);
  }
  return TYPE_ORDER.filter((t) => seen.has(t)).concat(
    Array.from(seen).filter((t) => !TYPE_ORDER.includes(t)),
  );
}
