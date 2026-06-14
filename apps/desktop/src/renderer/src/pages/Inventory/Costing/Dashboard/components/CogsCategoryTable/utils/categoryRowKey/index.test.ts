import { describe, it, expect } from 'vitest';
import { categoryRowKey } from '.';

describe('categoryRowKey', () => {
  it('returns the category id when present', () => {
    expect(categoryRowKey({ categoryId: 'cat-1', categoryName: 'Produce', total: 100 }, 0)).toBe(
      'cat-1',
    );
  });

  it('falls back to the row index when the category id is null', () => {
    expect(categoryRowKey({ categoryId: null, categoryName: null, total: 50 }, 2)).toBe(2);
  });
});
