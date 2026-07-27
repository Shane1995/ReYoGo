import { describe, it, expect } from 'vitest';
import { filterRowsByType } from '.';
import type { StockLevelRow } from '../../types';

function row(overrides: Partial<StockLevelRow> = {}): StockLevelRow {
  return {
    itemId: 'item-1',
    itemName: 'Milk',
    categoryName: 'Dairy',
    categoryType: 'food',
    quantity: 10,
    avgCost: 2,
    totalValue: 20,
    ...overrides,
  };
}

describe('filterRowsByType', () => {
  it('returns all rows when no type is selected', () => {
    const rows = [row({ itemId: 'a' }), row({ itemId: 'b', categoryType: 'beverage' })];
    expect(filterRowsByType(rows, '')).toEqual(rows);
  });

  it('filters rows down to the selected type', () => {
    const rows = [
      row({ itemId: 'a', categoryType: 'food' }),
      row({ itemId: 'b', categoryType: 'beverage' }),
      row({ itemId: 'c', categoryType: 'food' }),
    ];
    expect(filterRowsByType(rows, 'food').map((r) => r.itemId)).toEqual(['a', 'c']);
  });
});
