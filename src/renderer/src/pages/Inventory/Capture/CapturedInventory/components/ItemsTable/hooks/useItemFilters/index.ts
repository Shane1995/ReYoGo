import { useMemo, useState } from "react";
import type { FilterField, FilterValues } from "@/components/DataTable";
import type { InventoryCategory, InventoryItem } from "../../../../types";
import type { FlatItem, ItemCost } from "../../types";

type Props = {
  items: InventoryItem[];
  categories: InventoryCategory[];
  goodTypes: string[];
  costMap: Map<string, ItemCost>;
  stockMap: Map<string, number>;
  weightedAvgMap: Map<string, number | null>;
};

export function useItemFilters({ items, categories, goodTypes, costMap, stockMap, weightedAvgMap }: Props) {
  const [filterValues, setFilterValues] = useState<FilterValues>({});

  const allTypes = useMemo(() => {
    const fromCategories = categories.map((c) => c.type).filter(Boolean);
    return Array.from(new Set([...goodTypes, ...fromCategories]));
  }, [goodTypes, categories]);

  const flatItems = useMemo<FlatItem[]>(() => {
    return items.map((item) => {
      const category = categories.find((c) => c.id === item.categoryId);
      const cost = costMap.get(item.id);
      return {
        id: item.id,
        name: item.name,
        type: item.type,
        categoryId: item.categoryId,
        categoryName: category?.name ?? "—",
        unitOfMeasure: item.unitOfMeasure,
        lastCostPerUnit: cost?.price,
        lastCostUom: cost?.uom,
        currentStock: stockMap.get(item.id),
        weightedAvgCost: weightedAvgMap.get(item.id) ?? null,
      };
    });
  }, [items, categories, costMap, stockMap, weightedAvgMap]);

  const filteredItems = useMemo(() => {
    const search = (filterValues.search as string)?.toLowerCase() ?? "";
    const type = (filterValues.type as string) ?? "";
    const selectedCategories = (filterValues.category as string[]) ?? [];
    const selectedUnits = (filterValues.unit as string[]) ?? [];

    return flatItems.filter((item) => {
      if (search && !item.name.toLowerCase().includes(search)) return false;
      if (type && item.type !== type) return false;
      if (selectedCategories.length > 0 && !selectedCategories.includes(item.categoryId)) return false;
      if (selectedUnits.length > 0 && !selectedUnits.includes(item.unitOfMeasure ?? "")) return false;
      return true;
    });
  }, [flatItems, filterValues]);

  const categoryOptions = useMemo(() => {
    const seen = new Set<string>();
    return categories
      .filter((c) => c.name.trim() && !seen.has(c.id) && seen.add(c.id))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((c) => ({ value: c.id, label: c.name }));
  }, [categories]);

  const unitOptions = useMemo(() => {
    const used = Array.from(
      new Set(items.map((i) => i.unitOfMeasure).filter(Boolean) as string[])
    ).sort();
    return used.map((u) => ({ value: u, label: u }));
  }, [items]);

  const filters: FilterField[] = [
    { key: "search", label: "Items", type: "search", placeholder: "Search items…" },
    {
      key: "type",
      label: "Good Types",
      type: "select",
      options: allTypes.map((t) => ({ value: t, label: t })),
    },
    {
      key: "category",
      label: "Categories",
      type: "select",
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
      key: "unit",
      label: "Units",
      type: "select",
      multi: true,
      options: unitOptions,
    },
  ];

  function handleFilterChange(key: string, value: string | string[]) {
    setFilterValues((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "type") {
        const selectedType = value as string;
        const currentCats = (prev.category as string[]) ?? [];
        if (selectedType && currentCats.length > 0) {
          next.category = currentCats.filter((id) => {
            const cat = categories.find((c) => c.id === id);
            return cat?.type === selectedType;
          });
        }
      }
      return next;
    });
  }

  return {
    filterValues,
    filteredItems,
    filters,
    allTypes,
    handleFilterChange,
    clearFilters: () => setFilterValues({}),
  };
}
