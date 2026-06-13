import { describe, it, expect } from 'vitest';
import { typeWarningMessage } from '.';

describe('typeWarningMessage', () => {
  it('uses singular phrasing for a single category', () => {
    expect(typeWarningMessage(1)).toBe('1 category has an unrecognised type.');
  });

  it('uses plural phrasing for multiple categories', () => {
    expect(typeWarningMessage(2)).toBe('2 categories have an unrecognised type.');
  });
});
