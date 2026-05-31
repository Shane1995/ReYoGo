import type { IInvoiceWithLines } from '@reyogo/types';

export function invoiceTotals(invoice: IInvoiceWithLines) {
  let excl = 0;
  let vat = 0;
  for (const l of invoice.lines) {
    excl += l.totalVatExclude;
    vat += l.isVatable ? l.totalVatExclude * (invoice.vatRate / 100) : 0;
  }
  return { excl, vat, total: excl + vat };
}
