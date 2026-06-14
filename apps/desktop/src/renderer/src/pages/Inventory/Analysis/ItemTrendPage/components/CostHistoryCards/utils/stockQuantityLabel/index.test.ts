import { describe, it, expect } from 'vitest';
import { stockQuantityLabel } from '.';

describe('stockQuantityLabel', () => {
  it('formats whole numbers without decimals', () => {
    expect(stockQuantityLabel(10)).toBe('10');
  });

  it('formats fractional numbers with 2 decimals', () => {
    expect(stockQuantityLabel(10.5)).toBe('10.50');
  });

  it('formats zero as 0', () => {
    expect(stockQuantityLabel(0)).toBe('0');
  });
});
