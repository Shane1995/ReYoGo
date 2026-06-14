import { describe, it, expect } from 'vitest';
import { cogsTotalLabel } from '.';

describe('cogsTotalLabel', () => {
  it('returns an em dash when there is no COGS summary', () => {
    expect(cogsTotalLabel(null)).toBe('—');
  });

  it('returns the formatted total when a COGS summary is present', () => {
    expect(cogsTotalLabel({ total: 1234.5, byCategory: [] })).toBe('R 1 234,50');
  });
});
