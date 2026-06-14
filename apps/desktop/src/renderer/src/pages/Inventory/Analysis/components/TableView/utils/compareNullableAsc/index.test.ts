import { describe, it, expect } from 'vitest';
import { compareNullableAsc } from './index';

describe('compareNullableAsc', () => {
  it('returns zero when both values are null', () => {
    expect(compareNullableAsc(null, null)).toBe(0);
  });

  it('sorts null after a non-null value', () => {
    expect(compareNullableAsc(null, 5)).toBeGreaterThan(0);
  });

  it('sorts a non-null value before null', () => {
    expect(compareNullableAsc(5, null)).toBeLessThan(0);
  });

  it('returns a negative number when a is less than b', () => {
    expect(compareNullableAsc(1, 2)).toBeLessThan(0);
  });

  it('returns a positive number when a is greater than b', () => {
    expect(compareNullableAsc(2, 1)).toBeGreaterThan(0);
  });

  it('returns zero when both values are equal', () => {
    expect(compareNullableAsc(3, 3)).toBe(0);
  });
});
