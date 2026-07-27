import type {
  InventoryCategory,
  InventoryItem,
} from '@/pages/Inventory/Capture/CapturedInventory/types';
import type { StockLevelRow } from '../../types';

function categoryNameOf(categoryId: string, categories: InventoryCategory[]): string | undefined {
  return categories.find((category) => category.id === categoryId)?.name;
}

function rowOf(
  item: InventoryItem,
  categories: InventoryCategory[],
  stockByItem: Record<string, number>,
  avgCostByItem: Record<string, number | null>,
): StockLevelRow {
  const quantity = stockByItem[item.id] ?? 0;
  const avgCost = avgCostByItem[item.id] ?? 0;
  return {
    itemId: item.id,
    itemName: item.name,
    uom: item.unitOfMeasure,
    categoryName: categoryNameOf(item.categoryId, categories),
    categoryType: item.type,
    quantity,
    avgCost,
    totalValue: quantity * avgCost,
  };
}

export function stockLevelRowsOf(
  items: InventoryItem[],
  categories: InventoryCategory[],
  stockByItem: Record<string, number>,
  avgCostByItem: Record<string, number | null>,
): StockLevelRow[] {
  return items
    .map((item) => rowOf(item, categories, stockByItem, avgCostByItem))
    .sort((a, b) => a.itemName.localeCompare(b.itemName));
}
