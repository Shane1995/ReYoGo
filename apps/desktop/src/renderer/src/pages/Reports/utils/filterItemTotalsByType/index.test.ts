import { describe, it, expect } from 'vitest';
import { filterItemTotalsByType } from '.';
import type { ItemTotalRow } from '../itemTotalRowsOf/types';

const rows: ItemTotalRow[] = [
  { itemId: 'item-1', itemName: 'Milk', categoryType: 'food', qty: 1, totalValue: 1 },
  { itemId: 'item-2', itemName: 'Coke', categoryType: 'beverage', qty: 1, totalValue: 1 },
];

describe('filterItemTotalsByType', () => {
  it('returns all rows when no type is selected', () => {
    expect(filterItemTotalsByType(rows, '')).toEqual(rows);
  });

  it('keeps only rows matching the selected type', () => {
    expect(filterItemTotalsByType(rows, 'food').map((r) => r.itemId)).toEqual(['item-1']);
  });
});
