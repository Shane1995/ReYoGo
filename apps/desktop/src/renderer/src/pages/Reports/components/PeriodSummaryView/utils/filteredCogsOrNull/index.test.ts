import { describe, it, expect } from 'vitest';
import { filteredCogsOrNull } from '.';
import type { COGSSummary } from '@reyogo/types';

const cogs: COGSSummary = {
  total: 100,
  byCategory: [{ categoryId: 'c1', categoryName: 'Dairy', total: 100 }],
};

describe('filteredCogsOrNull', () => {
  it('returns null when cogs is null', () => {
    expect(filteredCogsOrNull(null, [])).toBeNull();
  });

  it('returns the filtered summary when cogs is present', () => {
    expect(filteredCogsOrNull(cogs, ['Dairy'])).toEqual(cogs);
  });
});
