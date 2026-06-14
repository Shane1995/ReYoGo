import { describe, it, expect } from 'vitest';
import { categoryNameOf } from '.';

describe('categoryNameOf', () => {
  it('returns the category name when present', () => {
    expect(categoryNameOf({ categoryId: 'cat-1', categoryName: 'Produce', total: 100 })).toBe(
      'Produce',
    );
  });

  it('falls back to "Uncategorised" when the category name is null', () => {
    expect(categoryNameOf({ categoryId: null, categoryName: null, total: 50 })).toBe(
      'Uncategorised',
    );
  });
});
