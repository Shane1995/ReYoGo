import { useMemo, useState } from 'react';
import { useAnalysisLines } from '../useAnalysisLines';
import { buildItemGroups } from '../../utils/buildItemGroups';
import { computeAvailableTypes } from '../../utils/computeAvailableTypes';
import { filterGroupsBySearchAndType } from '../../utils/filterGroupsBySearchAndType';
import { anyFilterActive } from '../../utils/anyFilterActive';
import { useItemGroupCategoryFilter } from '../../../hooks/useItemGroupCategoryFilter';
import { AnalysisTab } from '../../types';
import { useInventory } from '@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext';

export function useAnalysisData() {
  const { lines, loading } = useAnalysisLines();
  const { items } = useInventory();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [analysisTab, setAnalysisTab] = useState<AnalysisTab>(AnalysisTab.All);

  const allGroups = useMemo(
    () => buildItemGroups(lines, fromDate, toDate, items),
    [lines, fromDate, toDate, items],
  );

  const availableTypes = useMemo(() => computeAvailableTypes(allGroups), [allGroups]);
  const { filterCategory, setFilterCategory, availableCategories, filteredGroups } =
    useItemGroupCategoryFilter(allGroups);

  const groups = useMemo(
    () => filterGroupsBySearchAndType(filteredGroups, search, filterType),
    [filteredGroups, search, filterType],
  );

  const clearFilters = () => {
    setSearch('');
    setFromDate('');
    setToDate('');
    setFilterType('');
    setFilterCategory('');
  };

  const hasFilters = anyFilterActive(search, fromDate, toDate, filterType, filterCategory);

  return {
    lines,
    loading,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    search,
    setSearch,
    filterType,
    setFilterType,
    filterCategory,
    setFilterCategory,
    analysisTab,
    setAnalysisTab,
    allGroups,
    availableTypes,
    availableCategories,
    groups,
    hasFilters,
    clearFilters,
  };
}
