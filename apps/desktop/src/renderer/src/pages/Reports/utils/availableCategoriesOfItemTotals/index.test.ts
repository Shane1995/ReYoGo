import { describe, it, expect } from 'vitest';
import { availableCategoriesOfItemTotals } from '.';
import type { ItemTotalRow } from '../itemTotalRowsOf/types';

const rows: ItemTotalRow[] = [
  {
    itemId: 'item-1',
    itemName: 'Milk',
    categoryName: 'Dairy',
    categoryType: 'food',
    qty: 1,
    totalValue: 1,
  },
  {
    itemId: 'item-2',
    itemName: 'Coke',
    categoryName: 'Beverages',
    categoryType: 'beverage',
    qty: 1,
    totalValue: 1,
  },
  {
    itemId: 'item-3',
    itemName: 'Butter',
    categoryName: 'Dairy',
    categoryType: 'food',
    qty: 1,
    totalValue: 1,
  },
];

describe('availableCategoriesOfItemTotals', () => {
  it('returns unique category names sorted alphabetically', () => {
    expect(availableCategoriesOfItemTotals(rows)).toEqual(['Beverages', 'Dairy']);
  });

  it('returns an empty array when there are no rows', () => {
    expect(availableCategoriesOfItemTotals([])).toEqual([]);
  });
});
