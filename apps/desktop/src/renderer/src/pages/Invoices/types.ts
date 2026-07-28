export { VatMode } from '@reyogo/types';
import { VatMode } from '@reyogo/types';

export type ProcessReceiptLine = {
  id: string;
  itemId: string;
  quantity: number;
  isVatable: boolean;
  totalVatExclude: number;
  needsReview?: boolean;
  quantityNeedsReview?: boolean;
  totalNeedsReview?: boolean;
  taxNeedsReview?: boolean;
};

type LineTotals = { netTotal: number; grossTotal: number; vatAmount: number };

function nonVatableTotals(entered: number): LineTotals {
  return { netTotal: entered, grossTotal: entered, vatAmount: 0 };
}

function inclusiveTotals(entered: number, vatRate: number): LineTotals {
  const grossTotal = entered;
  const netTotal = vatRate > 0 ? grossTotal / (1 + vatRate / 100) : grossTotal;
  return { netTotal, grossTotal, vatAmount: grossTotal - netTotal };
}

function exclusiveTotals(entered: number, vatRate: number): LineTotals {
  const netTotal = entered;
  const vatAmount = netTotal * (vatRate / 100);
  return { netTotal, grossTotal: netTotal + vatAmount, vatAmount };
}

function lineTotalsOf(line: ProcessReceiptLine, vatMode: VatMode, vatRate: number): LineTotals {
  const entered = line.totalVatExclude ?? 0;
  if (!line.isVatable) return nonVatableTotals(entered);
  if (vatMode === VatMode.Inclusive) return inclusiveTotals(entered, vatRate);
  return exclusiveTotals(entered, vatRate);
}

function unitPriceOf(total: number, qty: number): number {
  if (qty <= 0) return 0;
  return total / qty;
}

export function getProcessLineComputed(
  line: ProcessReceiptLine,
  vatMode: VatMode,
  vatRate: number,
): {
  netUnitPrice: number;
  grossUnitPrice: number;
  netTotal: number;
  grossTotal: number;
  vatAmount: number;
} {
  const qty = line.quantity || 0;
  const { netTotal, grossTotal, vatAmount } = lineTotalsOf(line, vatMode, vatRate);
  return {
    netUnitPrice: unitPriceOf(netTotal, qty),
    grossUnitPrice: unitPriceOf(grossTotal, qty),
    netTotal,
    grossTotal,
    vatAmount,
  };
}
