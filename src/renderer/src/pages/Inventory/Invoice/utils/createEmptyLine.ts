import type { ProcessReceiptLine } from "../types";
import { DEFAULT_VAT_RATE } from "../types";

export function createEmptyLine(): ProcessReceiptLine {
  return {
    id: window.crypto.randomUUID(),
    itemId: "",
    quantity: 0,
    vatMode: "exclusive",
    vatRate: DEFAULT_VAT_RATE,
    totalVatExclude: 0,
  };
}
