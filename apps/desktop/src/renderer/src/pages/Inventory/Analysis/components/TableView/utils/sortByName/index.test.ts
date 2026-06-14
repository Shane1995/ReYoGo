import { describe, it, expect } from 'vitest';
import { sortByName } from './index';
import type { ItemGroup } from '../../../../types';

function makeGroup(name: string): ItemGroup {
  return {
    itemId: name,
    name,
    categoryType: 'food',
    entries: [],
  };
}

describe('sortByName', () => {
  it('returns a negative number when a sorts before b', () => {
    expect(sortByName(makeGroup('Apples'), makeGroup('Bananas'))).toBeLessThan(0);
  });

  it('returns a positive number when a sorts after b', () => {
    expect(sortByName(makeGroup('Bananas'), makeGroup('Apples'))).toBeGreaterThan(0);
  });

  it('returns zero when names are equal', () => {
    expect(sortByName(makeGroup('Apples'), makeGroup('Apples'))).toBe(0);
  });
});
