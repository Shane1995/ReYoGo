import { describe, it, expect } from 'vitest';
import { availableCategoriesOf } from '.';
import type { COGSSummary } from '@reyogo/types';

describe('availableCategoriesOf', () => {
  it('returns sorted category names', () => {
    const cogs: COGSSummary = {
      total: 150,
      byCategory: [
        { categoryId: 'c1', categoryName: 'Dairy', total: 100 },
        { categoryId: 'c2', categoryName: 'Beverages', total: 50 },
      ],
    };
    expect(availableCategoriesOf(cogs)).toEqual(['Beverages', 'Dairy']);
  });

  it('excludes null category names', () => {
    const cogs: COGSSummary = {
      total: 50,
      byCategory: [{ categoryId: 'c1', categoryName: null, total: 50 }],
    };
    expect(availableCategoriesOf(cogs)).toEqual([]);
  });
});
