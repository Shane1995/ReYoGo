import { describe, it, expect } from 'vitest';
import { entityInitials } from '.';

describe('entityInitials', () => {
  it('returns the first letter of each of the first two words, uppercased', () => {
    expect(entityInitials('Acme Corp')).toBe('AC');
  });

  it('returns a single letter for a single word', () => {
    expect(entityInitials('Acme')).toBe('A');
  });

  it('ignores words beyond the first two', () => {
    expect(entityInitials('Acme Corp Holdings')).toBe('AC');
  });

  it('collapses repeated whitespace between words', () => {
    expect(entityInitials('Acme   Corp')).toBe('AC');
  });
});
