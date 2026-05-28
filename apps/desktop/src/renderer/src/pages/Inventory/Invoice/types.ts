export type VatMode = 'inclusive' | 'exclusive';

export type ProcessReceiptLine = {
  id: string;
  itemId: string;
  quantity: number;
  isVatable: boolean;
  totalVatExclude: number;
};

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
  const entered = line.totalVatExclude ?? 0;
  let netTotal: number;
  let grossTotal: number;
  let vatAmount: number;
  if (!line.isVatable) {
    netTotal = entered;
    grossTotal = entered;
    vatAmount = 0;
  } else if (vatMode === 'inclusive') {
    grossTotal = entered;
    netTotal = vatRate > 0 ? grossTotal / (1 + vatRate / 100) : grossTotal;
    vatAmount = grossTotal - netTotal;
  } else {
    netTotal = entered;
    vatAmount = netTotal * (vatRate / 100);
    grossTotal = netTotal + vatAmount;
  }
  const netUnitPrice = qty > 0 ? netTotal / qty : 0;
  const grossUnitPrice = qty > 0 ? grossTotal / qty : 0;
  return { netUnitPrice, grossUnitPrice, netTotal, grossTotal, vatAmount };
}

export const DEFAULT_VAT_RATE = 15;
