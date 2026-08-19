import { groupByCategory } from '@/pages/Reports/utils/groupByCategory';
import type { CategoryBucket } from '@/pages/Reports/utils/groupByCategory/types';
import type {
  InventoryCategory,
  InventoryItem,
} from '@/pages/Inventory/Capture/CapturedInventory/types';
import type { CountSheetRow } from '../../types';

function categoryNameOf(categoryId: string, categories: InventoryCategory[]): string | undefined {
  return categories.find((category) => category.id === categoryId)?.name;
}

function lineValueOf(countedQty: number | null, lastCost: number | null): number | null {
  if (countedQty === null || lastCost === null) return null;
  return countedQty * lastCost;
}

function rowOf(
  item: InventoryItem,
  countedQtyByItem: Record<string, number>,
  lastCostByItem: Record<string, number>,
): CountSheetRow {
  const lastCost = lastCostByItem[item.id] ?? null;
  const countedQty = countedQtyByItem[item.id] ?? null;
  return {
    itemId: item.id,
    itemName: item.name,
    uom: item.unitOfMeasure,
    lastCost,
    countedQty,
    lineValue: lineValueOf(countedQty, lastCost),
  };
}

export function countSheetRowsOf(
  items: InventoryItem[],
  categories: InventoryCategory[],
  countedQtyByItem: Record<string, number>,
  lastCostByItem: Record<string, number>,
): CategoryBucket<CountSheetRow>[] {
  const rows = items
    .map((item) => rowOf(item, countedQtyByItem, lastCostByItem))
    .sort((a, b) => a.itemName.localeCompare(b.itemName));
  return groupByCategory(rows, (row) => {
    const item = items.find((i) => i.id === row.itemId);
    return item ? categoryNameOf(item.categoryId, categories) : undefined;
  });
}
