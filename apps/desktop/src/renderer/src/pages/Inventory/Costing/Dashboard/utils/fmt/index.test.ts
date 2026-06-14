import { describe, it, expect } from 'vitest';
import { fmt } from '.';

describe('fmt', () => {
  it('formats a positive number as ZAR currency', () => {
    expect(fmt(1234.5)).toBe('R 1 234,50');
  });

  it('formats zero as ZAR currency', () => {
    expect(fmt(0)).toBe('R 0,00');
  });

  it('formats a negative number as ZAR currency', () => {
    expect(fmt(-50)).toBe('-R 50,00');
  });
});
