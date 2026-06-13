import { useMemo, useState } from 'react';
import type { FilterField, FilterValues } from '@/components/DataTable';
import { typeGroupLabel } from '../../../../utils/typeConfig';
import type { InventoryCategory, InventoryItem } from '../../../../types';
import type { ItemCostEntry } from '../../../../hooks/useInventoryCosts';
import type { FlatItem } from '../../types';
import type { ParsedFilters, UseItemFiltersProps } from './types';

function stringFilter(value: unknown): string {
  if (typeof value === 'string') return value;
  return '';
}

function arrayFilter(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === 'string');
}

function parseFilterValues(filterValues: FilterValues): ParsedFilters {
  return {
    search: stringFilter(filterValues.search).toLowerCase(),
    type: stringFilter(filterValues.type),
    categories: arrayFilter(filterValues.category),
    units: arrayFilter(filterValues.unit),
  };
}

function matchesSearch(item: FlatItem, search: string): boolean {
  if (!search) return true;
  return item.name.toLowerCase().includes(search);
}

function matchesType(item: FlatItem, type: string): boolean {
  if (!type) return true;
  return item.type === type;
}

function matchesCategories(item: FlatItem, selected: string[]): boolean {
  if (selected.length === 0) return true;
  return selected.includes(item.categoryId);
}

function matchesUnits(item: FlatItem, selected: string[]): boolean {
  if (selected.length === 0) return true;
  return selected.includes(item.unitOfMeasure ?? '');
}

function matchesFilters(item: FlatItem, filters: ParsedFilters): boolean {
  if (!matchesSearch(item, filters.search)) return false;
  if (!matchesType(item, filters.type)) return false;
  if (!matchesCategories(item, filters.categories)) return false;
  return matchesUnits(item, filters.units);
}

function categoryNameOf(category: InventoryCategory | undefined): string {
  if (!category) return '—';
  return category.name;
}

function costNumberOf(value: number | null | undefined): number | undefined {
  if (value === null || value === undefined) return undefined;
  return value;
}

function weightedAvgCostOf(cost: ItemCostEntry | undefined): number | null {
  if (!cost) return null;
  return cost.weightedAvgCost;
}

function buildFlatItem(
  item: InventoryItem,
  category: InventoryCategory | undefined,
  cost: ItemCostEntry | undefined,
  currentStock: number | undefined,
): FlatItem {
  return {
    id: item.id,
    name: item.name,
    type: item.type,
    categoryId: item.categoryId,
    categoryName: categoryNameOf(category),
    unitOfMeasure: item.unitOfMeasure,
    lastCostPerUnit: costNumberOf(cost?.lastUnitCost),
    lastCostPerUnitInclVat: costNumberOf(cost?.lastUnitCostInclVat),
    lastCostUom: item.unitOfMeasure,
    currentStock,
    weightedAvgCost: weightedAvgCostOf(cost),
  };
}

export function useItemFilters({
  items,
  categories,
  costMap,
  stockMap,
  inventoryTypes,
}: UseItemFiltersProps) {
  const [filterValues, setFilterValues] = useState<FilterValues>({});

  const flatItems = useMemo<FlatItem[]>(() => {
    return items.map((item) => {
      const category = categories.find((c) => c.id === item.categoryId);
      const cost = costMap.get(item.id);
      return buildFlatItem(item, category, cost, stockMap.get(item.id));
    });
  }, [items, categories, costMap, stockMap]);

  const filteredItems = useMemo(() => {
    const filters = parseFilterValues(filterValues);
    return flatItems.filter((item) => matchesFilters(item, filters));
  }, [flatItems, filterValues]);

  const categoryOptions = useMemo(() => {
    const seen = new Set<string>();
    return categories
      .filter((c) => c.name.trim() && !seen.has(c.id) && seen.add(c.id))
      .sort((a, b) => {
        const tA = inventoryTypes.indexOf(a.type);
        const tB = inventoryTypes.indexOf(b.type);
        if (tA !== tB) return tA - tB;
        return a.name.localeCompare(b.name);
      })
      .map((c) => ({ value: c.id, label: c.name, group: typeGroupLabel(c.type) }));
  }, [categories, inventoryTypes]);

  const unitOptions = useMemo(() => {
    const used = Array.from(
      new Set(items.map((i) => i.unitOfMeasure).filter(Boolean) as string[]),
    ).sort();
    return used.map((u) => ({ value: u, label: u }));
  }, [items]);

  const filters: FilterField[] = [
    { key: 'search', label: 'Items', type: 'search', placeholder: 'Search items…' },
    {
      key: 'type',
      label: 'Type',
      type: 'select',
      options: inventoryTypes.map((t) => ({ value: t, label: t })),
    },
    {
      key: 'category',
      label: 'Categories',
      type: 'select',
      multi: true,
      options: (values) => {
        const selectedType = values.type as string;
        return categoryOptions.filter((opt) => {
          if (!selectedType) return true;
          const cat = categories.find((c) => c.id === opt.value);
          return cat?.type === selectedType;
        });
      },
    },
    {
      key: 'unit',
      label: 'Units',
      type: 'select',
      multi: true,
      options: unitOptions,
    },
  ];

  function applyTypeChange(next: FilterValues, prev: FilterValues, value: string | string[]): void {
    const selectedType = stringFilter(value);
    if (!selectedType) return;
    const currentCats = arrayFilter(prev.category);
    if (currentCats.length === 0) return;
    next.category = currentCats.filter((id) => {
      const cat = categories.find((c) => c.id === id);
      if (!cat) return false;
      return cat.type === selectedType;
    });
  }

  function handleFilterChange(key: string, value: string | string[]) {
    setFilterValues((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'type') applyTypeChange(next, prev, value);
      return next;
    });
  }

  return {
    filterValues,
    filteredItems,
    filters,
    allTypes: inventoryTypes,
    handleFilterChange,
    clearFilters: () => setFilterValues({}),
  };
}
