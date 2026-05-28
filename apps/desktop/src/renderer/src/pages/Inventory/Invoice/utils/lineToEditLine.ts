import type { ICapturedInvoiceWithLines, VatMode } from '@reyogo/types';
import type { ProcessReceiptLine } from '../types';

export function lineToEditLine(
  l: ICapturedInvoiceWithLines['lines'][number],
  vatMode: VatMode,
  vatRate: number,
): ProcessReceiptLine {
  // DB always stores net in totalVatExclude. For inclusive mode the edit input
  // expects gross (VAT-included) for vatable lines, so convert net back to gross here.
  const totalVatExclude =
    vatMode === 'inclusive' && l.isVatable && vatRate > 0
      ? l.totalVatExclude * (1 + vatRate / 100)
      : l.totalVatExclude;
  return {
    id: l.id,
    itemId: l.itemId,
    quantity: l.quantity,
    isVatable: l.isVatable,
    totalVatExclude,
  };
}
