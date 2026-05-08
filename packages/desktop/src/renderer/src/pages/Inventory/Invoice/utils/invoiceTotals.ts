import type { ICapturedInvoiceWithLines } from "@shared/types/contract";

export function invoiceTotals(lines: ICapturedInvoiceWithLines["lines"]) {
  let excl = 0;
  let vat = 0;
  for (const l of lines) {
    excl += l.totalVatExclude;
    vat += l.vatMode !== "non-taxable" ? l.totalVatExclude * (l.vatRate / 100) : 0;
  }
  return { excl, vat, total: excl + vat };
}
