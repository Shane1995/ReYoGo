import type { ItemGroup } from '../../../../types';

export function lastUnitPriceOf(group: ItemGroup): number {
  const last = group.entries[group.entries.length - 1];
  if (!last) return 0;
  return last.unitPriceInclVat;
}
