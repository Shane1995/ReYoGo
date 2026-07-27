import { describe, it, expect } from 'vitest';
import { filteredCogsOfType } from '.';
import type { COGSSummary } from '@reyogo/types';
import type { InventoryCategory } from '@/pages/Inventory/Capture/CapturedInventory/types';

const cogs: COGSSummary = {
  total: 150,
  byCategory: [
    { categoryId: 'c1', categoryName: 'Dairy', total: 100 },
    { categoryId: 'c2', categoryName: 'Beverages', total: 50 },
  ],
};

const categories: InventoryCategory[] = [
  { id: 'c1', name: 'Dairy', type: 'food' },
  { id: 'c2', name: 'Beverages', type: 'beverage' },
];

describe('filteredCogsOfType', () => {
  it('returns the summary unchanged when no type is selected', () => {
    expect(filteredCogsOfType(cogs, categories, '')).toEqual(cogs);
  });

  it('narrows byCategory and total to the selected type', () => {
    const filtered = filteredCogsOfType(cogs, categories, 'food');
    expect(filtered.total).toBe(100);
    expect(filtered.byCategory).toEqual([{ categoryId: 'c1', categoryName: 'Dairy', total: 100 }]);
  });

  it('returns a zero summary when no category matches the type', () => {
    const filtered = filteredCogsOfType(cogs, categories, 'non-food');
    expect(filtered).toEqual({ total: 0, byCategory: [] });
  });
});
