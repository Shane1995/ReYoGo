import { describe, it, expect } from 'vitest';
import { hasActiveFilters } from '.';

describe('hasActiveFilters', () => {
  it('returns false for empty values', () => {
    expect(hasActiveFilters({})).toBe(false);
  });

  it('returns false when string values are empty and array values are empty', () => {
    expect(hasActiveFilters({ search: '', tags: [] })).toBe(false);
  });

  it('returns true when a string value is set', () => {
    expect(hasActiveFilters({ search: 'abc' })).toBe(true);
  });

  it('returns true when an array value has entries', () => {
    expect(hasActiveFilters({ tags: ['a'] })).toBe(true);
  });
});
