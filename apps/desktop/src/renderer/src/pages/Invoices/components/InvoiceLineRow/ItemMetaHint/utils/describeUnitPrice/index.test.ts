import { describe, it, expect } from 'vitest';
import { VatMode } from '@reyogo/types';
import { describeUnitPrice } from './index';
import type { getProcessLineComputed } from '../../../../../types';

function makeComputed(
  overrides: Partial<ReturnType<typeof getProcessLineComputed>> = {},
): ReturnType<typeof getProcessLineComputed> {
  return {
    netUnitPrice: 0,
    grossUnitPrice: 0,
    netTotal: 0,
    grossTotal: 0,
    vatAmount: 0,
    ...overrides,
  };
}

describe('describeUnitPrice', () => {
  it('returns null when netUnitPrice is zero', () => {
    expect(describeUnitPrice(VatMode.Exclusive, makeComputed())).toBeNull();
  });

  it('describes the net unit price in exclusive mode', () => {
    const computed = makeComputed({ netUnitPrice: 10, grossUnitPrice: 11.5 });
    expect(describeUnitPrice(VatMode.Exclusive, computed)).toBe('10.00 / unit');
  });

  it('describes the gross unit price in inclusive mode', () => {
    const computed = makeComputed({ netUnitPrice: 10, grossUnitPrice: 11.5 });
    expect(describeUnitPrice(VatMode.Inclusive, computed)).toBe('11.50 / unit');
  });
});
