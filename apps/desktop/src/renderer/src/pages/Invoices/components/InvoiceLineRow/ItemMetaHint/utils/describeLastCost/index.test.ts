import { describe, it, expect } from 'vitest';
import { describeLastCost } from './index';

describe('describeLastCost', () => {
  it('returns null when lastUnitCostInclVat is undefined', () => {
    expect(describeLastCost(undefined)).toBeNull();
  });

  it('describes the last unit cost including VAT', () => {
    expect(describeLastCost(11.5)).toBe('Last 11.50 incl. VAT');
  });
});
