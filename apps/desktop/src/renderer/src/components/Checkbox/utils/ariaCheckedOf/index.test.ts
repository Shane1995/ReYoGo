import { describe, it, expect } from 'vitest';
import { ariaCheckedOf } from '.';

describe('ariaCheckedOf', () => {
  it('returns "mixed" when indeterminate is true', () => {
    expect(ariaCheckedOf(true, true)).toBe('mixed');
    expect(ariaCheckedOf(false, true)).toBe('mixed');
  });

  it('returns checked when indeterminate is false', () => {
    expect(ariaCheckedOf(true, false)).toBe(true);
    expect(ariaCheckedOf(false, false)).toBe(false);
  });

  it('returns checked when indeterminate is undefined', () => {
    expect(ariaCheckedOf(true, undefined)).toBe(true);
    expect(ariaCheckedOf(false, undefined)).toBe(false);
  });
});
