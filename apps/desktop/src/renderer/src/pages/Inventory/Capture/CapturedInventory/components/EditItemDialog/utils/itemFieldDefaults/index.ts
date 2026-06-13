import type { InventoryItem } from '../../../../types';
import type { ItemFieldDefaults } from './types';

export function itemFieldDefaults(item: InventoryItem | null): ItemFieldDefaults {
  if (!item) return { name: '', categoryId: '', unitOfMeasureId: '' };
  return {
    name: item.name,
    categoryId: item.categoryId,
    unitOfMeasureId: item.unitOfMeasureId ?? '',
  };
}
