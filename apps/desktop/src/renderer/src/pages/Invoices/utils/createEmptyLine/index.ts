import type { ProcessReceiptLine } from '../../types';

export function createEmptyLine(): ProcessReceiptLine {
  return {
    id: window.crypto.randomUUID(),
    itemId: '',
    quantity: 0,
    isVatable: false,
    totalVatExclude: 0,
  };
}
