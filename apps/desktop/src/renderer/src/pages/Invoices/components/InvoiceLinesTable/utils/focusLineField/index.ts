import type { ProcessReceiptLine } from '../../../../types';

export function focusLineField(lines: ProcessReceiptLine[], index: number, field: string): void {
  const line = lines[index];
  if (line) document.getElementById(`invoice-${field}-${line.id}`)?.focus();
}
