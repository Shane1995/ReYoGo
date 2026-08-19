import { describe, it, expect } from 'vitest';
import { stockTakeSummaryOf } from '.';
import type { CategoryBucket } from '@/pages/Reports/utils/groupByCategory/types';
import type { CountSheetRow } from '../../types';

const buckets: CategoryBucket<CountSheetRow>[] = [
  {
    category: 'Dairy',
    rows: [
      { itemId: 'i1', itemName: 'Milk', lastCost: 4, countedQty: 2, lineValue: 8 },
      { itemId: 'i2', itemName: 'Cheese', lastCost: 10, countedQty: null, lineValue: null },
    ],
  },
  {
    category: 'Beverages',
    rows: [{ itemId: 'i3', itemName: 'Coke', lastCost: 3, countedQty: 5, lineValue: 15 }],
  },
];

describe('stockTakeSummaryOf', () => {
  it('sums counted and total items across all categories', () => {
    const summary = stockTakeSummaryOf(buckets);
    expect(summary.countedCount).toBe(2);
    expect(summary.totalCount).toBe(3);
  });

  it('counts the number of categories', () => {
    expect(stockTakeSummaryOf(buckets).categoryCount).toBe(2);
  });

  it('sums the total value across all categories', () => {
    expect(stockTakeSummaryOf(buckets).totalValue).toBe(23);
  });

  it('returns zeros when there are no buckets', () => {
    expect(stockTakeSummaryOf([])).toEqual({
      countedCount: 0,
      totalCount: 0,
      categoryCount: 0,
      totalValue: 0,
    });
  });
});
