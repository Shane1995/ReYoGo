import type {
  InventoryCategory,
  InventoryItem,
} from '@/pages/Inventory/Capture/CapturedInventory/types';
import type { ItemTotalRow } from './types';

function categoryNameOf(categoryId: string, categories: InventoryCategory[]): string | undefined {
  return categories.find((category) => category.id === categoryId)?.name;
}

export function itemTotalRowsOf(
  items: InventoryItem[],
  categories: InventoryCategory[],
  totalsByItem: Record<string, { qty: number; totalValue: number }>,
): ItemTotalRow[] {
  return items
    .filter((item) => item.id in totalsByItem)
    .map((item) => {
      const total = totalsByItem[item.id]!;
      return {
        itemId: item.id,
        itemName: item.name,
        categoryName: categoryNameOf(item.categoryId, categories),
        categoryType: item.type,
        uom: item.unitOfMeasure,
        qty: total.qty,
        totalValue: total.totalValue,
      };
    })
    .sort((a, b) => a.itemName.localeCompare(b.itemName));
}
