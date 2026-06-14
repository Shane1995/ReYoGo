import type { ItemGroup } from '../../../../types';

export function sortByLastCaptured(a: ItemGroup, b: ItemGroup): number {
  const aDate = a.entries[a.entries.length - 1]?.date.getTime() ?? 0;
  const bDate = b.entries[b.entries.length - 1]?.date.getTime() ?? 0;
  return aDate - bDate;
}
