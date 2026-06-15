import { describe, expect, it } from 'vitest';
import { InvoiceStatus, VatMode } from '@reyogo/types';
import type { IInvoiceWithLines, IInvoiceLine } from '@reyogo/types';
import { invoiceTotals } from './index';

function buildLine(overrides: Partial<IInvoiceLine> = {}): IInvoiceLine {
  return {
    id: 'line-1',
    invoiceId: 'invoice-1',
    itemId: 'item-1',
    itemNameSnapshot: 'Tomatoes',
    quantity: 1,
    isVatable: false,
    totalVatExclude: 100,
    ...overrides,
  };
}

function buildInvoice(lines: IInvoiceLine[], vatRate = 20): IInvoiceWithLines {
  return {
    id: 'invoice-1',
    entityId: 'entity-1',
    supplierId: null,
    sourceInvoiceId: null,
    invoiceNumber: 'INV-1',
    invoiceDate: null,
    status: InvoiceStatus.Draft,
    vatMode: VatMode.Exclusive,
    vatRate,
    createdAt: new Date('2026-01-01'),
    updatedAt: null,
    lines,
  };
}

describe('invoiceTotals', () => {
  it('sums net totals across lines', () => {
    const invoice = buildInvoice([
      buildLine({ totalVatExclude: 100 }),
      buildLine({ totalVatExclude: 50 }),
    ]);
    expect(invoiceTotals(invoice).excl).toBe(150);
  });

  it('only applies vat to vatable lines', () => {
    const invoice = buildInvoice([
      buildLine({ totalVatExclude: 100, isVatable: true }),
      buildLine({ totalVatExclude: 100, isVatable: false }),
    ]);
    const totals = invoiceTotals(invoice);
    expect(totals.vat).toBe(20);
    expect(totals.total).toBe(220);
  });

  it('returns zero totals for an invoice with no lines', () => {
    const invoice = buildInvoice([]);
    expect(invoiceTotals(invoice)).toEqual({ excl: 0, vat: 0, total: 0 });
  });
});
