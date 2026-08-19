import { describe, it, expect } from 'vitest';
import { buildPurchaseReportSheetRows } from '.';
import type { ItemTotalRow } from '../../../itemTotalRowsOf/types';

const rows: ItemTotalRow[] = [
  {
    itemId: 'item-1',
    itemName: 'Milk',
    categoryName: 'Dairy',
    categoryType: 'food',
    uom: 'L',
    qty: 10,
    totalValue: 40,
  },
];

describe('buildPurchaseReportSheetRows', () => {
  it('builds a header row, category-grouped item rows, and a grand total row', () => {
    const sheet = buildPurchaseReportSheetRows(rows);
    expect(sheet[0]).toEqual(['Item', 'Category', 'Unit', 'Qty', 'Total Value']);
    expect(sheet[1]).toEqual(['Dairy']);
    expect(sheet[2]).toEqual(['Milk', 'L', 10, 40]);
    expect(sheet[3]).toEqual(['', '', '', 'Grand Total', 40]);
  });
});
