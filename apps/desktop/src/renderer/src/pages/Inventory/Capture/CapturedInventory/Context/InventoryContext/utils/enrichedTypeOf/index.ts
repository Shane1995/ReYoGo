import type { InventoryItem } from '../../../../types';

export function enrichedTypeOf(item: InventoryItem, categoryTypeMap: Map<string, string>): string {
  if (item.type) return item.type;
  return categoryTypeMap.get(item.categoryId) ?? '';
}
