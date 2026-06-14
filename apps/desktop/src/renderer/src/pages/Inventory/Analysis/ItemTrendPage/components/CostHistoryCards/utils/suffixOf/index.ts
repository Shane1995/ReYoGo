export function suffixOf(uom: string | undefined, prefix: string): string {
  if (!uom) return '';
  return `${prefix}${uom}`;
}
