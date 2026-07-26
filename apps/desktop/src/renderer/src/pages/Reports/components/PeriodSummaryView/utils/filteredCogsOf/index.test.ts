import { describe, it, expect } from 'vitest';
import { filteredCogsOf } from '.';
import type { COGSSummary } from '@reyogo/types';

const cogs: COGSSummary = {
  total: 150,
  byCategory: [
    { categoryId: 'c1', categoryName: 'Dairy', total: 100 },
    { categoryId: 'c2', categoryName: 'Beverages', total: 50 },
  ],
};

describe('filteredCogsOf', () => {
  it('returns the summary unchanged when no category is selected', () => {
    expect(filteredCogsOf(cogs, '')).toEqual(cogs);
  });

  it('narrows byCategory and total to the selected category', () => {
    const filtered = filteredCogsOf(cogs, 'Dairy');
    expect(filtered.total).toBe(100);
    expect(filtered.byCategory).toEqual([{ categoryId: 'c1', categoryName: 'Dairy', total: 100 }]);
  });

  it('returns a zero summary when the category has no matching rows', () => {
    const filtered = filteredCogsOf(cogs, 'Nonexistent');
    expect(filtered).toEqual({ total: 0, byCategory: [] });
  });
});
