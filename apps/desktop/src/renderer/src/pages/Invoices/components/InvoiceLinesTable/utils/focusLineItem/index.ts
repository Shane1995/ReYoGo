import type { ProcessReceiptLine } from '../../../../types';

export function focusLineItem(lines: ProcessReceiptLine[], index: number): void {
  const line = lines[index];
  if (line) document.getElementById(`invoice-item-${line.id}`)?.focus();
}
