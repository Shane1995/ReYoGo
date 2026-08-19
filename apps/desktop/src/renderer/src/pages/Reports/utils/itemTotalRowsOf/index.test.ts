import { describe, it, expect } from 'vitest';
import { itemTotalRowsOf } from '.';
import type {
  InventoryCategory,
  InventoryItem,
} from '@/pages/Inventory/Capture/CapturedInventory/types';

const categories: InventoryCategory[] = [{ id: 'cat-1', name: 'Dairy', type: 'food' }];

const items: InventoryItem[] = [
  { id: 'item-1', name: 'Milk', categoryId: 'cat-1', type: 'food', unitOfMeasure: 'L' },
  { id: 'item-2', name: 'Flour', categoryId: 'cat-1', type: 'food', unitOfMeasure: 'kg' },
];

describe('itemTotalRowsOf', () => {
  it('builds a row only for items with totals', () => {
    const rows = itemTotalRowsOf(items, categories, { 'item-1': { qty: 10, totalValue: 40 } });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({
      itemId: 'item-1',
      itemName: 'Milk',
      categoryName: 'Dairy',
      categoryType: 'food',
      uom: 'L',
      qty: 10,
      totalValue: 40,
    });
  });

  it('excludes items with no total', () => {
    const rows = itemTotalRowsOf(items, categories, { 'item-1': { qty: 10, totalValue: 40 } });
    expect(rows.find((r) => r.itemId === 'item-2')).toBeUndefined();
  });

  it('sorts rows alphabetically by item name', () => {
    const rows = itemTotalRowsOf(items, categories, {
      'item-1': { qty: 10, totalValue: 40 },
      'item-2': { qty: 5, totalValue: 10 },
    });
    expect(rows.map((r) => r.itemName)).toEqual(['Flour', 'Milk']);
  });
});
