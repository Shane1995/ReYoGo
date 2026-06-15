import { describe, expect, it } from 'vitest';
import { formatDate } from './index';

describe('formatDate', () => {
  it('formats a date using medium date style and short time style', () => {
    const date = new Date('2026-03-15T14:30:00Z');
    const expected = new Date(date).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    expect(formatDate(date)).toBe(expected);
  });

  it('accepts a string-like date value', () => {
    const date = new Date('2026-01-01T00:00:00Z');
    expect(formatDate(date)).toBe(
      new Date(date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }),
    );
  });
});
