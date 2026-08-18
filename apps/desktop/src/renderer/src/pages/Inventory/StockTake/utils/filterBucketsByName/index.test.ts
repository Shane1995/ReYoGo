import { describe, it, expect } from 'vitest';
import { filterBucketsByName } from '.';
import type { CategoryBucket } from '@/pages/Reports/utils/groupByCategory/types';
import type { CountSheetRow } from '../../types';

const buckets: CategoryBucket<CountSheetRow>[] = [
  {
    category: 'Dairy',
    rows: [
      { itemId: 'i1', itemName: 'Milk', lastCost: 4, countedQty: null, lineValue: null },
      { itemId: 'i2', itemName: 'Cheese', lastCost: 10, countedQty: null, lineValue: null },
    ],
  },
  {
    category: 'Beverages',
    rows: [{ itemId: 'i3', itemName: 'Coke', lastCost: 3, countedQty: null, lineValue: null }],
  },
];

describe('filterBucketsByName', () => {
  it('returns all buckets unchanged when the query is blank', () => {
    expect(filterBucketsByName(buckets, '')).toEqual(buckets);
  });

  it('keeps only rows matching the query, case-insensitively', () => {
    const result = filterBucketsByName(buckets, 'milk');
    expect(result).toHaveLength(1);
    expect(result[0]!.rows.map((r) => r.itemName)).toEqual(['Milk']);
  });

  it('drops categories with no matching rows', () => {
    const result = filterBucketsByName(buckets, 'coke');
    expect(result.map((b) => b.category)).toEqual(['Beverages']);
  });

  it('returns an empty array when nothing matches', () => {
    expect(filterBucketsByName(buckets, 'nonexistent')).toEqual([]);
  });
});
