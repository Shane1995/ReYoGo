import { describe, it, expect } from 'vitest';
import { searchPlaceholderOf } from '.';
import type { FilterField } from '../../../types';

describe('searchPlaceholderOf', () => {
  it('returns the field placeholder when set', () => {
    const field: FilterField = {
      key: 'q',
      label: 'Name',
      type: 'search',
      placeholder: 'Find item…',
    };
    expect(searchPlaceholderOf(field)).toBe('Find item…');
  });

  it('derives a placeholder from the field label when unset', () => {
    const field: FilterField = { key: 'q', label: 'Name', type: 'search' };
    expect(searchPlaceholderOf(field)).toBe('Search Name…');
  });
});
