import { describe, it, expect } from 'vitest';
import { getProcessLineComputed } from './types';
import type { ProcessReceiptLine } from './types';

function makeLine(overrides: Partial<ProcessReceiptLine>): ProcessReceiptLine {
  return {
    id: 'l1',
    itemId: 'i1',
    quantity: 2,
    vatMode: 'exclusive',
    vatRate: 15,
    totalVatExclude: 100,
    ...overrides,
  };
}

describe('getProcessLineComputed', () => {
  describe('exclusive mode', () => {
    it('netTotal equals entered amount', () => {
      const result = getProcessLineComputed(
        makeLine({ vatMode: 'exclusive', vatRate: 15, totalVatExclude: 100 }),
      );
      expect(result.netTotal).toBe(100);
    });

    it('vatAmount is netTotal × rate / 100', () => {
      const result = getProcessLineComputed(
        makeLine({ vatMode: 'exclusive', vatRate: 15, totalVatExclude: 100 }),
      );
      expect(result.vatAmount).toBeCloseTo(15);
    });

    it('grossTotal is netTotal + vatAmount', () => {
      const result = getProcessLineComputed(
        makeLine({ vatMode: 'exclusive', vatRate: 15, totalVatExclude: 100 }),
      );
      expect(result.grossTotal).toBeCloseTo(115);
    });
  });

  describe('inclusive mode', () => {
    it('grossTotal equals entered amount', () => {
      const result = getProcessLineComputed(
        makeLine({ vatMode: 'inclusive', vatRate: 15, totalVatExclude: 115 }),
      );
      expect(result.grossTotal).toBe(115);
    });

    it('netTotal is derived from grossTotal and rate', () => {
      const result = getProcessLineComputed(
        makeLine({ vatMode: 'inclusive', vatRate: 15, totalVatExclude: 115 }),
      );
      expect(result.netTotal).toBeCloseTo(100);
    });
  });

  describe('non-taxable mode', () => {
    it('netTotal equals grossTotal equals entered amount', () => {
      const result = getProcessLineComputed(
        makeLine({ vatMode: 'non-taxable', vatRate: 15, totalVatExclude: 80 }),
      );
      expect(result.netTotal).toBe(80);
      expect(result.grossTotal).toBe(80);
      expect(result.vatAmount).toBe(0);
    });
  });

  describe('unit prices', () => {
    it('unit prices are non-zero when qty > 0', () => {
      const result = getProcessLineComputed(makeLine({ quantity: 4, totalVatExclude: 100 }));
      expect(result.netUnitPrice).toBeGreaterThan(0);
    });

    it('unit prices are 0 when qty is 0 (no divide-by-zero)', () => {
      const result = getProcessLineComputed(makeLine({ quantity: 0, totalVatExclude: 100 }));
      expect(result.netUnitPrice).toBe(0);
      expect(result.grossUnitPrice).toBe(0);
    });
  });
});
