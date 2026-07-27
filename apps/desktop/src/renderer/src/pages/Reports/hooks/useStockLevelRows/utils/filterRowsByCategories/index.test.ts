import { describe, it, expect } from 'vitest';
import { filterRowsByCategories } from '.';
import type { StockLevelRow } from '../../../../hooks/useStockLevelRows/types';

function rowOf(itemId: string, categoryName?: string): StockLevelRow {
  return {
    itemId,
    itemName: itemId,
    categoryName,
    categoryType: 'food',
    quantity: 0,
    avgCost: 0,
    totalValue: 0,
  };
}

describe('filterRowsByCategories', () => {
  const rows = [rowOf('a', 'Dairy'), rowOf('b', 'Beverages'), rowOf('c', 'Meat')];

  it('returns all rows when nothing is selected', () => {
    expect(filterRowsByCategories(rows, [])).toEqual(rows);
  });

  it('keeps rows matching any selected category', () => {
    const filtered = filterRowsByCategories(rows, ['Dairy', 'Beverages']);
    expect(filtered.map((r) => r.itemId)).toEqual(['a', 'b']);
  });
});
