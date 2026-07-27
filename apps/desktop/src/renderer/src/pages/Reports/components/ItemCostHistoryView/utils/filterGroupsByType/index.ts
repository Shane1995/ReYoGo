import type { ItemGroup } from '@/pages/Inventory/Analysis/types';

export function filterGroupsByType(groups: ItemGroup[], type: string): ItemGroup[] {
  if (!type) return groups;
  return groups.filter((group) => group.categoryType === type);
}
