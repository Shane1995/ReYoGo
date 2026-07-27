import { describe, it, expect } from 'vitest';
import { buildStockValuationSheetRows } from '.';
import type { StockLevelRow } from '../../../../hooks/useStockLevelRows/types';

const rows: StockLevelRow[] = [
  {
    itemId: 'item-1',
    itemName: 'Milk',
    uom: 'L',
    categoryName: 'Dairy',
    categoryType: 'food',
    quantity: 10,
    avgCost: 2,
    totalValue: 20,
  },
];

describe('buildStockValuationSheetRows', () => {
  it('builds a header row, one row per item, and a grand total row', () => {
    const sheet = buildStockValuationSheetRows(rows);
    expect(sheet[0]).toEqual(['Item', 'Unit', 'Qty', 'Avg Cost', 'Total Value']);
    expect(sheet[1]).toEqual(['Milk', 'L', 10, 2, 20]);
    expect(sheet[2]).toEqual(['', '', '', 'Grand Total', 20]);
  });
});
