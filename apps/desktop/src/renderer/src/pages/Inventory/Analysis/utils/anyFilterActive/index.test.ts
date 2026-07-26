import { describe, it, expect } from 'vitest';
import { anyFilterActive } from '.';

describe('anyFilterActive', () => {
  it('returns false when all filters are empty', () => {
    expect(anyFilterActive('', '', '')).toBe(false);
  });

  it('returns true when at least one filter is non-empty', () => {
    expect(anyFilterActive('', 'set', '')).toBe(true);
  });

  it('returns false for no arguments', () => {
    expect(anyFilterActive()).toBe(false);
  });
});
