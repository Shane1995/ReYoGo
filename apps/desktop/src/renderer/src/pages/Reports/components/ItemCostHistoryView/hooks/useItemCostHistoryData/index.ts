import { useMemo } from 'react';
import { useAnalysisLines } from '@/pages/Inventory/Analysis/hooks/useAnalysisLines';
import { buildItemGroups } from '@/pages/Inventory/Analysis/utils/buildItemGroups';
import { useInventory } from '@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext';
import { useCategoryFilter } from '../useCategoryFilter';

export function useItemCostHistoryData(
  fromDate: string,
  toDate: string,
  entityId: string | undefined,
) {
  const { lines, loading } = useAnalysisLines(entityId);
  const { items } = useInventory();

  const allGroups = useMemo(
    () => buildItemGroups(lines, fromDate, toDate, items),
    [lines, fromDate, toDate, items],
  );

  const { selectedCategories, setSelectedCategories, availableCategories, filteredGroups } =
    useCategoryFilter(allGroups);

  return {
    loading,
    groups: filteredGroups,
    selectedCategories,
    setSelectedCategories,
    availableCategories,
  };
}
