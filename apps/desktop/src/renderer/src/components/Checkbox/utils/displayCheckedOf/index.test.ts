import { describe, it, expect } from 'vitest';
import { displayCheckedOf } from '.';

describe('displayCheckedOf', () => {
  it('returns false when indeterminate is true, regardless of checked', () => {
    expect(displayCheckedOf(true, true)).toBe(false);
    expect(displayCheckedOf(false, true)).toBe(false);
  });

  it('returns checked when indeterminate is false', () => {
    expect(displayCheckedOf(true, false)).toBe(true);
    expect(displayCheckedOf(false, false)).toBe(false);
  });

  it('returns checked when indeterminate is undefined', () => {
    expect(displayCheckedOf(true, undefined)).toBe(true);
    expect(displayCheckedOf(false, undefined)).toBe(false);
  });
});
