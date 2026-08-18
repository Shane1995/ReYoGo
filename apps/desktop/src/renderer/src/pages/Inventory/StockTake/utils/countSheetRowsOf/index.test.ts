import { describe, it, expect } from 'vitest';
import { countSheetRowsOf } from '.';
import type {
  InventoryCategory,
  InventoryItem,
} from '@/pages/Inventory/Capture/CapturedInventory/types';

const categories: InventoryCategory[] = [
  { id: 'cat-1', name: 'Dairy', type: 'food' },
  { id: 'cat-2', name: 'Beverages', type: 'beverage' },
];

const items: InventoryItem[] = [
  { id: 'item-1', name: 'Milk', categoryId: 'cat-1', type: 'food', unitOfMeasure: 'L' },
  { id: 'item-2', name: 'Cheese', categoryId: 'cat-1', type: 'food', unitOfMeasure: 'kg' },
  { id: 'item-3', name: 'Coke', categoryId: 'cat-2', type: 'beverage', unitOfMeasure: 'L' },
];

describe('countSheetRowsOf', () => {
  it('groups items by category, sorted alphabetically', () => {
    const buckets = countSheetRowsOf(items, categories, {}, {});
    expect(buckets.map((b) => b.category)).toEqual(['Beverages', 'Dairy']);
  });

  it('sorts items within a category alphabetically', () => {
    const buckets = countSheetRowsOf(items, categories, {}, {});
    const dairy = buckets.find((b) => b.category === 'Dairy')!;
    expect(dairy.rows.map((r) => r.itemName)).toEqual(['Cheese', 'Milk']);
  });

  it('attaches last cost and counted qty per item when present', () => {
    const buckets = countSheetRowsOf(items, categories, { 'item-1': 7 }, { 'item-1': 4.5 });
    const milk = buckets.flatMap((b) => b.rows).find((r) => r.itemId === 'item-1')!;
    expect(milk.countedQty).toBe(7);
    expect(milk.lastCost).toBe(4.5);
  });

  it('defaults countedQty and lastCost to null when not present', () => {
    const buckets = countSheetRowsOf(items, categories, {}, {});
    const milk = buckets.flatMap((b) => b.rows).find((r) => r.itemId === 'item-1')!;
    expect(milk.countedQty).toBeNull();
    expect(milk.lastCost).toBeNull();
  });

  it('computes lineValue as countedQty times lastCost when both are known', () => {
    const buckets = countSheetRowsOf(items, categories, { 'item-1': 7 }, { 'item-1': 4.5 });
    const milk = buckets.flatMap((b) => b.rows).find((r) => r.itemId === 'item-1')!;
    expect(milk.lineValue).toBe(31.5);
  });

  it('leaves lineValue null when countedQty or lastCost is missing', () => {
    const buckets = countSheetRowsOf(items, categories, {}, { 'item-1': 4.5 });
    const milk = buckets.flatMap((b) => b.rows).find((r) => r.itemId === 'item-1')!;
    expect(milk.lineValue).toBeNull();
  });
});
