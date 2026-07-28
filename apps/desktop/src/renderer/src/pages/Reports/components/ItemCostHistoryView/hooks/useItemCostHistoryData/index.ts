import { useMemo } from 'react';
import { useAnalysisLines } from '@/pages/Inventory/Analysis/hooks/useAnalysisLines';
import { buildItemGroups } from '@/pages/Inventory/Analysis/utils/buildItemGroups';
import { computeAvailableTypes } from '@/pages/Inventory/Analysis/utils/computeAvailableTypes';
import { useInventory } from '@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext';
import { availableCategoriesOfGroups } from '../../utils/availableCategoriesOfGroups';
import { filterGroupsByCategories } from '../../utils/filterGroupsByCategories';
import { filterGroupsByType } from '../../utils/filterGroupsByType';

export function useItemCostHistoryData(
  fromDate: string,
  toDate: string,
  entityId: string | undefined,
  selectedCategories: string[],
  selectedType: string,
) {
  const { lines, loading } = useAnalysisLines(entityId);
  const { items } = useInventory();

  const allGroups = useMemo(
    () => buildItemGroups(lines, fromDate, toDate, items),
    [lines, fromDate, toDate, items],
  );

  const availableCategories = useMemo(() => availableCategoriesOfGroups(allGroups), [allGroups]);
  const availableTypes = useMemo(() => computeAvailableTypes(allGroups), [allGroups]);

  const groups = useMemo(() => {
    const byCategory = filterGroupsByCategories(allGroups, selectedCategories);
    return filterGroupsByType(byCategory, selectedType);
  }, [allGroups, selectedCategories, selectedType]);

  return { loading, groups, availableCategories, availableTypes };
}
