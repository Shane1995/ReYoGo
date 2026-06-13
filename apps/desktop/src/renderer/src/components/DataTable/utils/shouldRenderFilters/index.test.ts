import { describe, it, expect } from 'vitest';
import { shouldRenderFilters } from '.';

describe('shouldRenderFilters', () => {
  it('returns false when hideFilters is true', () => {
    expect(shouldRenderFilters(true, 3)).toBe(false);
  });

  it('returns false when there are no filters', () => {
    expect(shouldRenderFilters(false, 0)).toBe(false);
  });

  it('returns true when not hidden and filters exist', () => {
    expect(shouldRenderFilters(false, 1)).toBe(true);
  });
});
