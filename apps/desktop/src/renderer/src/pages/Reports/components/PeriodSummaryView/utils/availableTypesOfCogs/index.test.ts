import { describe, it, expect } from 'vitest';
import { availableTypesOfCogs } from '.';
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

describe('availableTypesOfCogs', () => {
  it('returns an empty array when no rows match a known category', () => {
    expect(availableTypesOfCogs({ total: 0, byCategory: [] }, categories)).toEqual([]);
  });

  it('lists distinct types in TYPE_ORDER order, joined via categoryId', () => {
    expect(availableTypesOfCogs(cogs, categories)).toEqual(['food', 'beverage']);
  });

  it('ignores rows whose categoryId has no matching category', () => {
    const orphan: COGSSummary = {
      total: 10,
      byCategory: [{ categoryId: 'unknown', categoryName: 'Ghost', total: 10 }],
    };
    expect(availableTypesOfCogs(orphan, categories)).toEqual([]);
  });
});
