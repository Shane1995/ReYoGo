import type { ItemGroup } from '../../../../../../types';

export function prevInclVatOf(entries: ItemGroup['entries'], index: number): number | null {
  if (index <= 0) return null;
  const prev = entries[index - 1];
  if (!prev) return null;
  return prev.unitPriceInclVat;
}
