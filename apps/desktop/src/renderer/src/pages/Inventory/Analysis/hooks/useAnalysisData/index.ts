import { useMemo, useState } from 'react';
import { useAnalysisLines } from '../useAnalysisLines';
import { buildItemGroups } from '../../utils/buildItemGroups';
import { useItemGroupCategoryFilter } from '../../../hooks/useItemGroupCategoryFilter';
import { TYPE_ORDER } from '../../constants';
import type { ItemGroup } from '../../types';
import { useInventory } from '@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext';

export type AnalysisTab = 'all' | 'by-type' | 'by-category';

function computeAvailableTypes(allGroups: ItemGroup[]): string[] {
  const seen = new Set(allGroups.map((g) => g.categoryType));
  return TYPE_ORDER.filter((t) => seen.has(t)).concat(
    Array.from(seen).filter((t) => !TYPE_ORDER.includes(t)),
  );
}

function filterGroupsBySearchAndType(
  groups: ItemGroup[],
  search: string,
  filterType: string,
): ItemGroup[] {
  let filtered = groups;
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter((g) => g.name.toLowerCase().includes(q));
  }
  if (filterType) {
    filtered = filtered.filter((g) => g.categoryType === filterType);
  }
  return filtered;
}

function anyFilterActive(...filters: string[]): boolean {
  return filters.some((filter) => !!filter);
}

export function useAnalysisData() {
  const { lines, loading } = useAnalysisLines();
  const { items } = useInventory();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [analysisTab, setAnalysisTab] = useState<AnalysisTab>('all');

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
