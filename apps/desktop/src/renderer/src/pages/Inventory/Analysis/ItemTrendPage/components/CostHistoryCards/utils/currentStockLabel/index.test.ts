import { describe, it, expect } from 'vitest';
import type { ItemCostHistory } from '@reyogo/types';
import { currentStockLabel } from '.';

const baseCostHistory: ItemCostHistory = {
  itemId: 'item-1',
  weightedAvgCost: 12.5,
  totalStock: 4,
  movements: [],
};

describe('currentStockLabel', () => {
  it('formats whole stock quantities with the given suffix', () => {
    expect(currentStockLabel(baseCostHistory, ' kg')).toBe('4 kg');
  });

  it('formats fractional stock quantities with 2 decimals', () => {
    expect(currentStockLabel({ ...baseCostHistory, totalStock: 4.25 }, ' kg')).toBe('4.25 kg');
  });

  it('formats zero stock with the given suffix', () => {
    expect(currentStockLabel({ ...baseCostHistory, totalStock: 0 }, ' kg')).toBe('0 kg');
  });
});
