import { describe, it, expect } from 'vitest';
import { fmt, fmtDate, fmtDateShort, fmtPct } from './index';

describe('fmt', () => {
  it('formats a number with two decimal places', () => {
    expect(fmt(1)).toBe('1.00');
    expect(fmt(1.5)).toBe('1.50');
  });
});

describe('fmtDate', () => {
  it('formats a date using the medium date style', () => {
    const result = fmtDate(new Date('2025-01-15T00:00:00'));
    expect(result).toBe(
      new Date('2025-01-15T00:00:00').toLocaleDateString(undefined, { dateStyle: 'medium' }),
    );
  });
});

describe('fmtDateShort', () => {
  it('formats a date using a short month and day', () => {
    const result = fmtDateShort(new Date('2025-01-15T00:00:00'));
    expect(result).toBe(
      new Date('2025-01-15T00:00:00').toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      }),
    );
  });
});

describe('fmtPct', () => {
  it('prefixes positive values with a plus sign', () => {
    expect(fmtPct(5)).toBe('+5.0%');
  });

  it('does not prefix negative values', () => {
    expect(fmtPct(-5)).toBe('-5.0%');
  });

  it('prefixes zero with a plus sign', () => {
    expect(fmtPct(0)).toBe('+0.0%');
  });
});
