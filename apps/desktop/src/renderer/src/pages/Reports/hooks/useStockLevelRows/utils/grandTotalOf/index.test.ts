import { describe, it, expect } from 'vitest';
import { grandTotalOf } from '.';
import type { StockLevelRow } from '../../types';

function rowOf(totalValue: number): StockLevelRow {
  return {
    itemId: 'item',
    itemName: 'Item',
    categoryType: 'food',
    quantity: 1,
    avgCost: totalValue,
    totalValue,
  };
}

describe('grandTotalOf', () => {
  it('sums the total value across all rows', () => {
    expect(grandTotalOf([rowOf(10), rowOf(25), rowOf(0)])).toBe(35);
  });

  it('returns zero for an empty list', () => {
    expect(grandTotalOf([])).toBe(0);
  });
});
