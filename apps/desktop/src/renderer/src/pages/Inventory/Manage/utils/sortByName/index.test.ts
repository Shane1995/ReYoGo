import { describe, it, expect } from 'vitest';
import { sortByName } from '.';
import type { ArchivedItem } from '../../types';

const apples: ArchivedItem = { id: '1', name: 'Apples', categoryName: 'Produce' };
const bananas: ArchivedItem = { id: '2', name: 'Bananas', categoryName: 'Produce' };

describe('sortByName', () => {
  it('returns a negative number when a comes before b', () => {
    expect(sortByName(apples, bananas)).toBeLessThan(0);
  });

  it('returns a positive number when a comes after b', () => {
    expect(sortByName(bananas, apples)).toBeGreaterThan(0);
  });

  it('returns zero when names are equal', () => {
    expect(sortByName(apples, { ...bananas, name: apples.name })).toBe(0);
  });
});
