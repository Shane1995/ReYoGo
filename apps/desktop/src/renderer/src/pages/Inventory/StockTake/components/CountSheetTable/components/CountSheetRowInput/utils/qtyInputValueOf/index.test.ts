import { describe, it, expect } from 'vitest';
import { qtyInputValueOf } from '.';

describe('qtyInputValueOf', () => {
  it('returns the number when counted', () => {
    expect(qtyInputValueOf(5)).toBe(5);
  });

  it('returns an empty string when not counted', () => {
    expect(qtyInputValueOf(null)).toBe('');
  });
});
