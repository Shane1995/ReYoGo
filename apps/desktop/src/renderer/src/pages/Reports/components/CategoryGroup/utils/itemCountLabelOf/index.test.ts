import { describe, it, expect } from 'vitest';
import { itemCountLabelOf } from '.';

describe('itemCountLabelOf', () => {
  it('uses singular for a count of 1', () => {
    expect(itemCountLabelOf(1)).toBe('1 item');
  });

  it('uses plural for any other count', () => {
    expect(itemCountLabelOf(0)).toBe('0 items');
    expect(itemCountLabelOf(2)).toBe('2 items');
  });
});
