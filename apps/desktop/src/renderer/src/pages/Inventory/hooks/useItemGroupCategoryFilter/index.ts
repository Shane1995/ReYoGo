import { useMemo, useState } from 'react';
import type { ItemGroup } from '../../Analysis/types';

function computeAvailableCategories(groups: ItemGroup[]): string[] {
  const seen = new Map<string, string>();
  for (const g of groups) {
    if (g.categoryName && !seen.has(g.categoryName)) {
      seen.set(g.categoryName, g.categoryName);
    }
  }
  return Array.from(seen.keys()).sort();
}

function filterGroupsByCategory(groups: ItemGroup[], filterCategory: string): ItemGroup[] {
  if (!filterCategory) return groups;
  return groups.filter((g) => g.categoryName === filterCategory);
}

export function useItemGroupCategoryFilter(groups: ItemGroup[]) {
  const [filterCategory, setFilterCategory] = useState('');

  const availableCategories = useMemo(() => computeAvailableCategories(groups), [groups]);
  const filteredGroups = useMemo(
    () => filterGroupsByCategory(groups, filterCategory),
    [groups, filterCategory],
  );

  return { filterCategory, setFilterCategory, availableCategories, filteredGroups };
}
