import { describe, it, expect } from 'vitest';
import { sortStockRows } from '.';
import { StockSortKey } from '../../types';
import type { StockLevelRow } from '../../types';

function rowOf(itemName: string, quantity: number, totalValue: number): StockLevelRow {
  return { itemId: itemName, itemName, categoryType: 'food', quantity, avgCost: 0, totalValue };
}

describe('sortStockRows', () => {
  const rows = [rowOf('Milk', 5, 50), rowOf('Bread', 20, 10), rowOf('Cola', 1, 100)];

  it('sorts alphabetically by name', () => {
    const sorted = sortStockRows(rows, StockSortKey.Name);
    expect(sorted.map((r) => r.itemName)).toEqual(['Bread', 'Cola', 'Milk']);
  });

  it('sorts by quantity descending', () => {
    const sorted = sortStockRows(rows, StockSortKey.Quantity);
    expect(sorted.map((r) => r.itemName)).toEqual(['Bread', 'Milk', 'Cola']);
  });

  it('sorts by total value descending', () => {
    const sorted = sortStockRows(rows, StockSortKey.TotalValue);
    expect(sorted.map((r) => r.itemName)).toEqual(['Cola', 'Milk', 'Bread']);
  });

  it('does not mutate the input array', () => {
    const original = [...rows];
    sortStockRows(rows, StockSortKey.Name);
    expect(rows).toEqual(original);
  });
});
