import { describe, it, expect } from 'vitest';
import { sortByCategory } from '.';
import type { ArchivedItem } from '../../types';

const beverages: ArchivedItem = { id: '1', name: 'Cola', categoryName: 'Beverages' };
const produce: ArchivedItem = { id: '2', name: 'Apples', categoryName: 'Produce' };

describe('sortByCategory', () => {
  it('returns a negative number when a comes before b', () => {
    expect(sortByCategory(beverages, produce)).toBeLessThan(0);
  });

  it('returns a positive number when a comes after b', () => {
    expect(sortByCategory(produce, beverages)).toBeGreaterThan(0);
  });

  it('returns zero when category names are equal', () => {
    expect(sortByCategory(beverages, { ...produce, categoryName: beverages.categoryName })).toBe(0);
  });
});
