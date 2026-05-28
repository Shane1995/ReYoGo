import type { ProcessReceiptLine } from '../types';

export function createEmptyLine(): ProcessReceiptLine {
  return {
    id: window.crypto.randomUUID(),
    itemId: '',
    quantity: 0,
    isVatable: true,
    totalVatExclude: 0,
  };
}
