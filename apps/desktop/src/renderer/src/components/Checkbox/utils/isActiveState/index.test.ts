import { describe, it, expect } from 'vitest';
import { isActiveState } from '.';

describe('isActiveState', () => {
  it('returns true when checked', () => {
    expect(isActiveState(true, false)).toBe(true);
    expect(isActiveState(true, undefined)).toBe(true);
  });

  it('returns true when indeterminate even if not checked', () => {
    expect(isActiveState(false, true)).toBe(true);
  });

  it('returns false when neither checked nor indeterminate', () => {
    expect(isActiveState(false, false)).toBe(false);
    expect(isActiveState(false, undefined)).toBe(false);
  });
});
