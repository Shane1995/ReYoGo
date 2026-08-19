export function parseQtyInput(value: string): number | null {
  return value === '' ? null : Number(value);
}
