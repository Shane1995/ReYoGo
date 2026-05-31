import { describe, it, expect } from 'vitest';
import { VatMode } from '@reyogo/types';
import { getProcessLineComputed } from './types';
import type { ProcessReceiptLine } from './types';

function makeLine(overrides: Partial<ProcessReceiptLine>): ProcessReceiptLine {
  return {
    id: 'l1',
    itemId: 'i1',
    quantity: 2,
    isVatable: true,
    totalVatExclude: 100,
    ...overrides,
  };
}

describe('getProcessLineComputed', () => {
  describe('exclusive mode', () => {
    it('netTotal equals entered amount', () => {
      const result = getProcessLineComputed(
        makeLine({ totalVatExclude: 100 }),
        VatMode.Exclusive,
        15,
      );
      expect(result.netTotal).toBe(100);
    });

    it('vatAmount is netTotal × rate / 100', () => {
      const result = getProcessLineComputed(
        makeLine({ totalVatExclude: 100 }),
        VatMode.Exclusive,
        15,
      );
      expect(result.vatAmount).toBeCloseTo(15);
    });

    it('grossTotal is netTotal + vatAmount', () => {
      const result = getProcessLineComputed(
        makeLine({ totalVatExclude: 100 }),
        VatMode.Exclusive,
        15,
      );
      expect(result.grossTotal).toBeCloseTo(115);
    });
  });

  describe('inclusive mode', () => {
    it('grossTotal equals entered amount', () => {
      const result = getProcessLineComputed(
        makeLine({ totalVatExclude: 115 }),
        VatMode.Inclusive,
        15,
      );
      expect(result.grossTotal).toBe(115);
    });

    it('netTotal is derived from grossTotal and rate', () => {
      const result = getProcessLineComputed(
        makeLine({ totalVatExclude: 115 }),
        VatMode.Inclusive,
        15,
      );
      expect(result.netTotal).toBeCloseTo(100);
    });
  });

  describe('non-vatable line', () => {
    it('netTotal equals grossTotal equals entered amount, zero VAT', () => {
      const result = getProcessLineComputed(
        makeLine({ isVatable: false, totalVatExclude: 80 }),
        VatMode.Exclusive,
        15,
      );
      expect(result.netTotal).toBe(80);
      expect(result.grossTotal).toBe(80);
      expect(result.vatAmount).toBe(0);
    });

    it('non-vatable in inclusive mode still produces zero VAT', () => {
      const result = getProcessLineComputed(
        makeLine({ isVatable: false, totalVatExclude: 80 }),
        VatMode.Inclusive,
        15,
      );
      expect(result.vatAmount).toBe(0);
      expect(result.netTotal).toBe(80);
    });
  });

  describe('unit prices', () => {
    it('unit prices are non-zero when qty > 0', () => {
      const result = getProcessLineComputed(
        makeLine({ quantity: 4, totalVatExclude: 100 }),
        VatMode.Exclusive,
        15,
      );
      expect(result.netUnitPrice).toBeGreaterThan(0);
    });

    it('unit prices are 0 when qty is 0 (no divide-by-zero)', () => {
      const result = getProcessLineComputed(
        makeLine({ quantity: 0, totalVatExclude: 100 }),
        VatMode.Exclusive,
        15,
      );
      expect(result.netUnitPrice).toBe(0);
      expect(result.grossUnitPrice).toBe(0);
    });
  });
});
