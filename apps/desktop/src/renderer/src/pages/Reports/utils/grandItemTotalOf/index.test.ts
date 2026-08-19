import { describe, it, expect } from 'vitest';
import { grandItemTotalOf } from '.';
import type { ItemTotalRow } from '../itemTotalRowsOf/types';

const rows: ItemTotalRow[] = [
  { itemId: 'item-1', itemName: 'Milk', categoryType: 'food', qty: 10, totalValue: 40 },
  { itemId: 'item-2', itemName: 'Flour', categoryType: 'food', qty: 5, totalValue: 10 },
];

describe('grandItemTotalOf', () => {
  it('sums the total value across all rows', () => {
    expect(grandItemTotalOf(rows)).toBe(50);
  });

  it('returns zero for an empty list', () => {
    expect(grandItemTotalOf([])).toBe(0);
  });
});
