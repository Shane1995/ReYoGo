import type { ProcessReceiptLine } from '../../types';

export function lineNeedsReview(line: ProcessReceiptLine): boolean {
  return (
    !!line.needsReview ||
    !!line.quantityNeedsReview ||
    !!line.totalNeedsReview ||
    !!line.taxNeedsReview
  );
}
