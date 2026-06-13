import { describe, it, expect } from 'vitest';
import { isValidItemInput } from '.';

describe('isValidItemInput', () => {
  it('returns true when both name and category are provided', () => {
    expect(isValidItemInput('Tomatoes', 'cat-1')).toBe(true);
  });

  it('returns false when the name is empty', () => {
    expect(isValidItemInput('', 'cat-1')).toBe(false);
  });

  it('returns false when no category is selected', () => {
    expect(isValidItemInput('Tomatoes', '')).toBe(false);
  });
});
