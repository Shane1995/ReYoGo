import { describe, it, expect } from 'vitest';
import { categorySummaryOf } from '.';
import type { CountSheetRow } from '../../../../types';

const rows: CountSheetRow[] = [
  { itemId: 'i1', itemName: 'Milk', lastCost: 4, countedQty: 2, lineValue: 8 },
  { itemId: 'i2', itemName: 'Cheese', lastCost: 10, countedQty: null, lineValue: null },
  { itemId: 'i3', itemName: 'Cream', lastCost: 3, countedQty: 5, lineValue: 15 },
];

describe('categorySummaryOf', () => {
  it('counts how many rows have been counted out of the total', () => {
    expect(categorySummaryOf(rows)).toMatchObject({ countedCount: 2, totalCount: 3 });
  });

  it('sums the line value of counted rows', () => {
    expect(categorySummaryOf(rows).value).toBe(23);
  });

  it('returns zeros for an empty bucket', () => {
    expect(categorySummaryOf([])).toEqual({ countedCount: 0, totalCount: 0, value: 0 });
  });
});
