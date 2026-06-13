import type { InventoryItem } from '../../../../types';

export function enrichedUnitOfMeasureOf(
  item: InventoryItem,
  unitMap: Map<string, string>,
): string | undefined {
  if (item.unitOfMeasure) return item.unitOfMeasure;
  if (!item.unitOfMeasureId) return undefined;
  return unitMap.get(item.unitOfMeasureId);
}
