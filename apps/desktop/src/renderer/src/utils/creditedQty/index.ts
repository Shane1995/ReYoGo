const EPSILON = 1e-6;

function netRemainingQty(originalQty: number, creditedQty: number): number {
  return originalQty - creditedQty;
}

export function isFullyCredited(originalQty: number, creditedQty: number): boolean {
  return netRemainingQty(originalQty, creditedQty) <= EPSILON;
}
