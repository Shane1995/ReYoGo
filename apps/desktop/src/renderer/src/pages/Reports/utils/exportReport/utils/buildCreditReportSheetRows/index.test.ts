import { describe, it, expect } from 'vitest';
import { buildCreditReportSheetRows } from '.';
import type { ItemTotalRow } from '../../../itemTotalRowsOf/types';

const rows: ItemTotalRow[] = [
  {
    itemId: 'item-1',
    itemName: 'Milk',
    categoryName: 'Dairy',
    categoryType: 'food',
    uom: 'L',
    qty: 2,
    totalValue: 8,
  },
];

describe('buildCreditReportSheetRows', () => {
  it('builds a header row, category-grouped item rows, and a grand total row', () => {
    const sheet = buildCreditReportSheetRows(rows);
    expect(sheet[0]).toEqual(['Item', 'Category', 'Unit', 'Qty', 'Total Value']);
    expect(sheet[1]).toEqual(['Dairy']);
    expect(sheet[2]).toEqual(['Milk', 'L', 2, 8]);
    expect(sheet[3]).toEqual(['', '', '', 'Grand Total', 8]);
  });
});
