import { describe, it, expect } from 'vitest';
import { groupSheetRowsByCategory } from '.';
import { UNCATEGORIZED_CATEGORY_LABEL } from '../../../../constants';

type Row = { name: string; category?: string; qty: number };

const rowOf = (row: Row): (string | number)[] => [row.name, row.qty];
const categoryOf = (row: Row): string | undefined => row.category;

describe('groupSheetRowsByCategory', () => {
  it('returns an empty array for empty input', () => {
    expect(groupSheetRowsByCategory<Row>([], categoryOf, rowOf)).toEqual([]);
  });

  it('inserts a category header row before each bucket, sorted alphabetically', () => {
    const rows: Row[] = [
      { name: 'Coke', category: 'Beverages', qty: 3 },
      { name: 'Milk', category: 'Dairy', qty: 10 },
      { name: 'Cheese', category: 'Dairy', qty: 5 },
    ];
    const sheetRows = groupSheetRowsByCategory(rows, categoryOf, rowOf);
    expect(sheetRows).toEqual([['Beverages'], ['Coke', 3], ['Dairy'], ['Milk', 10], ['Cheese', 5]]);
  });

  it('buckets rows with no category under the uncategorized label', () => {
    const rows: Row[] = [{ name: 'Mystery', qty: 1 }];
    const sheetRows = groupSheetRowsByCategory(rows, categoryOf, rowOf);
    expect(sheetRows).toEqual([[UNCATEGORIZED_CATEGORY_LABEL], ['Mystery', 1]]);
  });
});
