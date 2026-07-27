import { useMemo, useState } from 'react';
import type { ItemGroup } from '@/pages/Inventory/Analysis/types';
import { availableCategoriesOfGroups } from '../../utils/availableCategoriesOfGroups';
import { filterGroupsByCategories } from '../../utils/filterGroupsByCategories';

export function useCategoryFilter(groups: ItemGroup[]) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const availableCategories = useMemo(() => availableCategoriesOfGroups(groups), [groups]);
  const filteredGroups = useMemo(
    () => filterGroupsByCategories(groups, selectedCategories),
    [groups, selectedCategories],
  );

  return { selectedCategories, setSelectedCategories, availableCategories, filteredGroups };
}
