import { describe, it, expect } from 'vitest';
import { parseQtyInput } from '.';

describe('parseQtyInput', () => {
  it('parses a numeric string', () => {
    expect(parseQtyInput('12')).toBe(12);
  });

  it('returns null for an empty string', () => {
    expect(parseQtyInput('')).toBeNull();
  });
});
