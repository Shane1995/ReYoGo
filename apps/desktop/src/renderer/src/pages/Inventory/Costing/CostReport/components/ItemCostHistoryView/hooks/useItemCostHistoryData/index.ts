import { useMemo } from 'react';
import { useAnalysisLines } from '@/pages/Inventory/Analysis/hooks/useAnalysisLines';
import { buildItemGroups } from '@/pages/Inventory/Analysis/utils/buildItemGroups';
import { useItemGroupCategoryFilter } from '@/pages/Inventory/hooks/useItemGroupCategoryFilter';
import { useInventory } from '@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext';

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

  const { filterCategory, setFilterCategory, availableCategories, filteredGroups } =
    useItemGroupCategoryFilter(allGroups);

  return {
    loading,
    groups: filteredGroups,
    filterCategory,
    setFilterCategory,
    availableCategories,
  };
}
