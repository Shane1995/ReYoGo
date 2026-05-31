export function toDateStr(d: Date | string | null | undefined): string {
  if (!d) return '';
  const s = typeof d === 'string' ? d : d.toISOString();
  return s.slice(0, 10);
}
