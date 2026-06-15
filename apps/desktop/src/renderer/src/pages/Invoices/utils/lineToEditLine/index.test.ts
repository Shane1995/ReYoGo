import { describe, expect, it } from 'vitest';
import { VatMode } from '@reyogo/types';
import type { ICapturedInvoiceWithLines } from '@reyogo/types';
import { lineToEditLine } from './index';

function buildLine(
  overrides: Partial<ICapturedInvoiceWithLines['lines'][number]> = {},
): ICapturedInvoiceWithLines['lines'][number] {
  return {
    id: 'line-1',
    invoiceId: 'invoice-1',
    itemId: 'item-1',
    itemNameSnapshot: 'Tomatoes',
    quantity: 2,
    isVatable: true,
    totalVatExclude: 100,
    ...overrides,
  };
}

describe('lineToEditLine', () => {
  it('passes the net amount through unchanged in exclusive mode', () => {
    const result = lineToEditLine(buildLine(), VatMode.Exclusive, 20);
    expect(result.totalVatExclude).toBe(100);
  });

  it('converts net to gross for vatable lines in inclusive mode', () => {
    const result = lineToEditLine(buildLine(), VatMode.Inclusive, 20);
    expect(result.totalVatExclude).toBe(120);
  });

  it('does not convert non-vatable lines in inclusive mode', () => {
    const result = lineToEditLine(buildLine({ isVatable: false }), VatMode.Inclusive, 20);
    expect(result.totalVatExclude).toBe(100);
  });

  it('does not convert when the vat rate is zero', () => {
    const result = lineToEditLine(buildLine(), VatMode.Inclusive, 0);
    expect(result.totalVatExclude).toBe(100);
  });

  it('maps the remaining fields onto the edit line', () => {
    const result = lineToEditLine(buildLine(), VatMode.Exclusive, 20);
    expect(result).toEqual({
      id: 'line-1',
      itemId: 'item-1',
      quantity: 2,
      isVatable: true,
      totalVatExclude: 100,
    });
  });
});
