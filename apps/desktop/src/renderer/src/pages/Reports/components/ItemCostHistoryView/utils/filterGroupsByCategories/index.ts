import type { ItemGroup } from '@/pages/Inventory/Analysis/types';

function matchesSelection(categoryName: string | undefined, selected: string[]): boolean {
  return categoryName !== undefined && selected.includes(categoryName);
}

export function filterGroupsByCategories(groups: ItemGroup[], selected: string[]): ItemGroup[] {
  if (selected.length === 0) return groups;
  return groups.filter((group) => matchesSelection(group.categoryName, selected));
}
