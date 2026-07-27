import { describe, it, expect } from 'vitest';
import { stockLevelRowsOf } from '.';
import type {
  InventoryCategory,
  InventoryItem,
} from '@/pages/Inventory/Capture/CapturedInventory/types';

const categories: InventoryCategory[] = [{ id: 'cat-1', name: 'Dairy', type: 'food' }];

const items: InventoryItem[] = [
  { id: 'item-1', name: 'Milk', categoryId: 'cat-1', type: 'food', unitOfMeasure: 'L' },
  { id: 'item-2', name: 'Flour', categoryId: 'cat-1', type: 'food', unitOfMeasure: 'kg' },
];

describe('stockLevelRowsOf', () => {
  it('multiplies quantity by average cost for the total value', () => {
    const rows = stockLevelRowsOf(items, categories, { 'item-1': 10 }, { 'item-1': 2.5 });
    const milk = rows.find((r) => r.itemId === 'item-1')!;
    expect(milk.quantity).toBe(10);
    expect(milk.avgCost).toBe(2.5);
    expect(milk.totalValue).toBe(25);
  });

  it('includes items with zero stock at a zero total value', () => {
    const rows = stockLevelRowsOf(items, categories, {}, {});
    const flour = rows.find((r) => r.itemId === 'item-2')!;
    expect(flour.quantity).toBe(0);
    expect(flour.avgCost).toBe(0);
    expect(flour.totalValue).toBe(0);
  });

  it('treats a null average cost as zero', () => {
    const rows = stockLevelRowsOf(items, categories, { 'item-1': 5 }, { 'item-1': null });
    const milk = rows.find((r) => r.itemId === 'item-1')!;
    expect(milk.totalValue).toBe(0);
  });

  it('resolves the category name from categoryId', () => {
    const rows = stockLevelRowsOf(items, categories, {}, {});
    expect(rows[0]!.categoryName).toBe('Dairy');
  });

  it('sorts rows alphabetically by item name', () => {
    const rows = stockLevelRowsOf(items, categories, {}, {});
    expect(rows.map((r) => r.itemName)).toEqual(['Flour', 'Milk']);
  });
});
