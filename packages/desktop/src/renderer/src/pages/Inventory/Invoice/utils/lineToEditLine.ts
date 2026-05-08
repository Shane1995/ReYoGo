import type { ICapturedInvoiceWithLines } from "@shared/types/contract";
import type { ProcessReceiptLine } from "../types";

export function lineToEditLine(l: ICapturedInvoiceWithLines["lines"][number]): ProcessReceiptLine {
  // DB always stores net in totalVatExclude. For inclusive mode the edit input
  // expects gross (VAT-included), so convert net back to gross here.
  const totalVatExclude =
    l.vatMode === "inclusive" && l.vatRate > 0
      ? l.totalVatExclude * (1 + l.vatRate / 100)
      : l.totalVatExclude;
  return {
    id: l.id,
    itemId: l.itemId,
    quantity: l.quantity,
    vatMode: l.vatMode,
    vatRate: l.vatRate,
    totalVatExclude,
  };
}
