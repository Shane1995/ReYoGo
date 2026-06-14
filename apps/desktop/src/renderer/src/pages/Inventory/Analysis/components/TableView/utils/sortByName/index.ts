import type { ItemGroup } from '../../../../types';

export function sortByName(a: ItemGroup, b: ItemGroup): number {
  return a.name.localeCompare(b.name);
}
