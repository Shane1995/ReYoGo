import { describe, it, expect } from 'vitest';
import { availableTypesOfItemTotals } from '.';
import type { ItemTotalRow } from '../itemTotalRowsOf/types';

const rows: ItemTotalRow[] = [
  { itemId: 'item-1', itemName: 'Milk', categoryType: 'food', qty: 1, totalValue: 1 },
  { itemId: 'item-2', itemName: 'Coke', categoryType: 'beverage', qty: 1, totalValue: 1 },
];

describe('availableTypesOfItemTotals', () => {
  it('returns unique types present in the rows, in TYPE_ORDER order', () => {
    expect(availableTypesOfItemTotals(rows)).toEqual(['food', 'beverage']);
  });

  it('returns an empty array when there are no rows', () => {
    expect(availableTypesOfItemTotals([])).toEqual([]);
  });
});
