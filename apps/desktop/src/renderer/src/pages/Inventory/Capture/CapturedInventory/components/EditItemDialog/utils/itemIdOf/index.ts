import type { InventoryItem } from '../../../../types';

export function itemIdOf(item: InventoryItem | null): string | null {
  if (!item) return null;
  return item.id;
}
