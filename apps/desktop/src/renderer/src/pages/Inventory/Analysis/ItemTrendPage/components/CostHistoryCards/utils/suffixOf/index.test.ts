import { describe, it, expect } from 'vitest';
import { suffixOf } from '.';

describe('suffixOf', () => {
  it('returns an empty string when uom is undefined', () => {
    expect(suffixOf(undefined, ' / ')).toBe('');
  });

  it('prefixes the uom with the given prefix', () => {
    expect(suffixOf('kg', ' / ')).toBe(' / kg');
  });

  it('supports a different prefix', () => {
    expect(suffixOf('L', ' ')).toBe(' L');
  });
});
