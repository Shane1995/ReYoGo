import type { InventoryCategory, InventoryItem } from '../../../../types';

export function saveValuesOf(
  name: string,
  categoryId: string,
  selectedCategory: InventoryCategory | undefined,
  unitOfMeasureId: string,
): Omit<InventoryItem, 'id'> {
  return {
    name: name.trim(),
    categoryId,
    type: selectedCategory?.type ?? '',
    unitOfMeasureId: unitOfMeasureId || null,
  };
}
