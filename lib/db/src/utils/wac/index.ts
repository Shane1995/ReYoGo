export function calculateWAC(
  prevQty: number,
  prevWac: number | null,
  inQty: number,
  unitCost: number,
): number {
  const totalQty = prevQty + inQty;
  if (totalQty === 0) return 0;
  if (prevQty === 0 || prevWac === null) return unitCost;
  return Math.round(((prevQty * prevWac + inQty * unitCost) / totalQty) * 10000) / 10000;
}
