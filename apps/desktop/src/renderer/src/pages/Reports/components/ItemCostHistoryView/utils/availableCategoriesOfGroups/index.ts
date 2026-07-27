import type { ItemGroup } from '@/pages/Inventory/Analysis/types';

export function availableCategoriesOfGroups(groups: ItemGroup[]): string[] {
  const seen = new Set<string>();
  for (const group of groups) {
    if (group.categoryName) seen.add(group.categoryName);
  }
  return Array.from(seen).sort();
}
