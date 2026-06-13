import { describe, it, expect } from 'vitest';
import type { FlatItem } from '../../types';
import { sortByName, sortByCategory, sortByStock, sortByLastCost, sortByAvgCost } from '.';

function makeItem(overrides: Partial<FlatItem> = {}): FlatItem {
  return {
    id: 'item-1',
    name: 'Apple',
    type: 'food',
    categoryId: 'cat-1',
    categoryName: 'Produce',
    ...overrides,
  };
}

describe('sortByName', () => {
  it('sorts alphabetically by name', () => {
    const a = makeItem({ name: 'Banana' });
    const b = makeItem({ name: 'Apple' });
    expect(sortByName(a, b)).toBeGreaterThan(0);
  });
});

describe('sortByCategory', () => {
  it('sorts alphabetically by category name', () => {
    const a = makeItem({ categoryName: 'Seafood' });
    const b = makeItem({ categoryName: 'Produce' });
    expect(sortByCategory(a, b)).toBeGreaterThan(0);
  });
});

describe('sortByStock', () => {
  it('sorts ascending by current stock', () => {
    const a = makeItem({ currentStock: 5 });
    const b = makeItem({ currentStock: 10 });
    expect(sortByStock(a, b)).toBeLessThan(0);
  });

  it('treats missing stock as greater than any value', () => {
    const a = makeItem({ currentStock: undefined });
    const b = makeItem({ currentStock: 10 });
    expect(sortByStock(a, b)).toBe(1);
  });

  it('treats two missing stock values as equal', () => {
    const a = makeItem({ currentStock: undefined });
    const b = makeItem({ currentStock: undefined });
    expect(sortByStock(a, b)).toBe(0);
  });
});

describe('sortByLastCost', () => {
  it('sorts ascending by last cost incl. VAT', () => {
    const a = makeItem({ lastCostPerUnitInclVat: 5 });
    const b = makeItem({ lastCostPerUnitInclVat: 10 });
    expect(sortByLastCost(a, b)).toBeLessThan(0);
  });

  it('treats missing last cost as greater than any value', () => {
    const a = makeItem({ lastCostPerUnitInclVat: undefined });
    const b = makeItem({ lastCostPerUnitInclVat: 10 });
    expect(sortByLastCost(a, b)).toBe(1);
  });
});

describe('sortByAvgCost', () => {
  it('sorts ascending by weighted average cost', () => {
    const a = makeItem({ weightedAvgCost: 5 });
    const b = makeItem({ weightedAvgCost: 10 });
    expect(sortByAvgCost(a, b)).toBeLessThan(0);
  });

  it('treats a null weighted average cost as greater than any value', () => {
    const a = makeItem({ weightedAvgCost: null });
    const b = makeItem({ weightedAvgCost: 10 });
    expect(sortByAvgCost(a, b)).toBe(1);
  });
});
