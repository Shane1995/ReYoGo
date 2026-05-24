import { describe, it, expect } from 'vitest';
import { formatZAR } from '.';

describe('formatZAR', () => {
  it('formats zero', () => {
    expect(formatZAR(0)).toBe('R 0,00');
  });

  it('formats a whole number with two decimal places', () => {
    expect(formatZAR(1000)).toBe('R 1 000,00');
  });

  it('formats a decimal value', () => {
    expect(formatZAR(1234.5)).toBe('R 1 234,50');
  });

  it('rounds to two decimal places', () => {
    expect(formatZAR(1.999)).toBe('R 2,00');
  });

  it('handles negative values', () => {
    const result = formatZAR(-50);
    expect(result).toMatch(/^R /);
  });
});
