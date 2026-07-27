import { describe, it, expect } from 'vitest';
import { availableCategoriesOfRows } from '.';
import type { StockLevelRow } from '../../../../hooks/useStockLevelRows/types';

function rowOf(categoryName?: string): StockLevelRow {
  return {
    itemId: categoryName ?? 'none',
    itemName: 'Item',
    categoryName,
    categoryType: 'food',
    quantity: 0,
    avgCost: 0,
    totalValue: 0,
  };
}

describe('availableCategoriesOfRows', () => {
  it('returns sorted, de-duplicated category names', () => {
    const rows = [rowOf('Dairy'), rowOf('Beverages'), rowOf('Dairy')];
    expect(availableCategoriesOfRows(rows)).toEqual(['Beverages', 'Dairy']);
  });

  it('excludes rows with no category', () => {
    expect(availableCategoriesOfRows([rowOf(undefined)])).toEqual([]);
  });
});
