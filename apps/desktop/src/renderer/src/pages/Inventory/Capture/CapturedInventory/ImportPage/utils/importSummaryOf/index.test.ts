import { describe, it, expect } from 'vitest';
import { InventoryType } from '@reyogo/types';
import { importSummaryOf } from '.';
import { ReviewStatus } from '@/components/CsvImport/review';
import type { ReviewResult } from '@/components/CsvImport/review';

function reviewOf(overrides: Partial<ReviewResult>): ReviewResult {
  return {
    units: [],
    categories: [],
    items: [],
    parseErrors: [],
    availableCategories: [],
    counts: { newTotal: 0, existsTotal: 0, unresolvedTotal: 0 },
    ...overrides,
  };
}

describe('importSummaryOf', () => {
  it('counts selected new categories and items that were committed', () => {
    const review = reviewOf({
      categories: [
        {
          id: 'c1',
          name: 'Dairy',
          type: InventoryType.Food,
          status: ReviewStatus.New,
          selected: true,
        },
        {
          id: 'c2',
          name: 'Meat',
          type: InventoryType.Food,
          status: ReviewStatus.New,
          selected: false,
        },
      ],
      items: [
        { name: 'Milk', categoryName: 'Dairy', status: ReviewStatus.New, selected: true },
        { name: 'Cheese', categoryName: 'Dairy', status: ReviewStatus.New, selected: true },
      ],
    });
    expect(importSummaryOf(review)).toBe('Imported 1 category and 2 items');
  });

  it('pluralises correctly for a single item and no categories', () => {
    const review = reviewOf({
      items: [{ name: 'Milk', categoryName: 'Dairy', status: ReviewStatus.New, selected: true }],
    });
    expect(importSummaryOf(review)).toBe('Imported 1 item');
  });

  it('ignores unselected or already-existing rows', () => {
    const review = reviewOf({
      categories: [
        {
          id: 'c1',
          name: 'Dairy',
          type: InventoryType.Food,
          status: ReviewStatus.Exists,
          selected: true,
        },
      ],
      items: [{ name: 'Milk', categoryName: 'Dairy', status: ReviewStatus.New, selected: false }],
    });
    expect(importSummaryOf(review)).toBe('Imported 0 items');
  });
});
