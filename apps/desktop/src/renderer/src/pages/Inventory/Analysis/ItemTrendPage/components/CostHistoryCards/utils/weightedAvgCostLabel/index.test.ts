import { describe, it, expect } from 'vitest';
import type { ItemCostHistory } from '@reyogo/types';
import { weightedAvgCostLabel } from '.';

const baseCostHistory: ItemCostHistory = {
  itemId: 'item-1',
  weightedAvgCost: 12.5,
  totalStock: 4,
  movements: [],
};

describe('weightedAvgCostLabel', () => {
  it('formats the weighted average cost with the given suffix', () => {
    expect(weightedAvgCostLabel(baseCostHistory, ' / kg')).toBe('12.50 / kg');
  });

  it('returns a dash when weightedAvgCost is null', () => {
    expect(weightedAvgCostLabel({ ...baseCostHistory, weightedAvgCost: null }, ' / kg')).toBe('—');
  });

  it('formats with an empty suffix when none provided', () => {
    expect(weightedAvgCostLabel(baseCostHistory, '')).toBe('12.50');
  });
});
