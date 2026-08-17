import { describe, it, expect } from 'vitest';
import { filterItemTotalsByCategories } from '.';
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
];

describe('filterItemTotalsByCategories', () => {
  it('returns all rows when no categories are selected', () => {
    expect(filterItemTotalsByCategories(rows, [])).toEqual(rows);
  });

  it('keeps only rows matching a selected category', () => {
    expect(filterItemTotalsByCategories(rows, ['Dairy']).map((r) => r.itemId)).toEqual(['item-1']);
  });
});
