import { describe, it, expect } from 'vitest';
import { InventoryType } from '@reyogo/types';
import { isInventoryType } from '.';

describe('isInventoryType', () => {
  it('returns true for each known inventory type', () => {
    expect(isInventoryType(InventoryType.Food)).toBe(true);
    expect(isInventoryType(InventoryType.Beverage)).toBe(true);
    expect(isInventoryType(InventoryType.NonFood)).toBe(true);
  });

  it('returns false for an unknown value', () => {
    expect(isInventoryType('unknown')).toBe(false);
  });
});
