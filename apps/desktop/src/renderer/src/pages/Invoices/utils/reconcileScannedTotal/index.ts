import { MIN_ROUNDING_TOLERANCE, ROUNDING_TOLERANCE_PER_LINE } from './constants';
import type { TotalMismatch } from './types';

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function reconcileScannedTotal(
  lines: { quantity: number; unitPrice: number }[],
  invoiceTotal: number | null,
): TotalMismatch | null {
  if (invoiceTotal === null) return null;

  const computedTotal = round2(lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0));
  const difference = round2(computedTotal - invoiceTotal);
  const tolerance = Math.max(MIN_ROUNDING_TOLERANCE, lines.length * ROUNDING_TOLERANCE_PER_LINE);

  if (Math.abs(difference) <= tolerance) return null;

  return { computedTotal, invoiceTotal, difference };
}
