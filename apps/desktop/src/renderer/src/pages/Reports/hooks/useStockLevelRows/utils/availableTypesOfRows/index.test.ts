import { describe, it, expect } from 'vitest';
import { availableTypesOfRows } from '.';
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

describe('availableTypesOfRows', () => {
  it('returns an empty array for no rows', () => {
    expect(availableTypesOfRows([])).toEqual([]);
  });

  it('lists distinct types in TYPE_ORDER order', () => {
    const rows = [
      row({ itemId: 'a', categoryType: 'beverage' }),
      row({ itemId: 'b', categoryType: 'food' }),
      row({ itemId: 'c', categoryType: 'food' }),
    ];
    expect(availableTypesOfRows(rows)).toEqual(['food', 'beverage']);
  });
});
