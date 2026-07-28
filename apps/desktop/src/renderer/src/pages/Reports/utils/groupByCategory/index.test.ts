import { describe, it, expect } from 'vitest';
import { groupByCategory } from '.';
import { UNCATEGORIZED_CATEGORY_LABEL } from '../../constants';

type Row = { name: string; category?: string };

describe('groupByCategory', () => {
  it('returns an empty array for empty input', () => {
    expect(groupByCategory<Row>([], (r) => r.category)).toEqual([]);
  });

  it('buckets rows by category', () => {
    const rows: Row[] = [
      { name: 'Milk', category: 'Dairy' },
      { name: 'Cheese', category: 'Dairy' },
      { name: 'Coke', category: 'Beverages' },
    ];
    const buckets = groupByCategory(rows, (r) => r.category);
    expect(buckets).toEqual([
      { category: 'Beverages', rows: [rows[2]] },
      { category: 'Dairy', rows: [rows[0], rows[1]] },
    ]);
  });

  it('sorts buckets alphabetically by category name', () => {
    const rows: Row[] = [
      { name: 'Z', category: 'Zucchini' },
      { name: 'A', category: 'Apples' },
    ];
    const buckets = groupByCategory(rows, (r) => r.category);
    expect(buckets.map((b) => b.category)).toEqual(['Apples', 'Zucchini']);
  });

  it('buckets rows with no category under the uncategorized label', () => {
    const rows: Row[] = [{ name: 'Mystery' }];
    const buckets = groupByCategory(rows, (r) => r.category);
    expect(buckets).toEqual([{ category: UNCATEGORIZED_CATEGORY_LABEL, rows: [rows[0]] }]);
  });

  it('buckets rows with an empty-string category under the uncategorized label', () => {
    const rows: Row[] = [{ name: 'Mystery', category: '' }];
    const buckets = groupByCategory(rows, (r) => r.category);
    expect(buckets).toEqual([{ category: UNCATEGORIZED_CATEGORY_LABEL, rows: [rows[0]] }]);
  });
});
