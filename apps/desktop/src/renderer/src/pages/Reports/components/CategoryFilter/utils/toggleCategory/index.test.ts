import { describe, it, expect } from 'vitest';
import { toggleCategory } from '.';

describe('toggleCategory', () => {
  it('adds a category that is not yet selected', () => {
    expect(toggleCategory(['Dairy'], 'Beverages')).toEqual(['Dairy', 'Beverages']);
  });

  it('removes a category that is already selected', () => {
    expect(toggleCategory(['Dairy', 'Beverages'], 'Dairy')).toEqual(['Beverages']);
  });

  it('starts a new selection from empty', () => {
    expect(toggleCategory([], 'Dairy')).toEqual(['Dairy']);
  });
});
