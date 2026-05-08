import { useState, useCallback } from "react";
import type { InventoryItem } from "../../types";

export function useInventorySelection() {
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(new Set());

  const hasSelection = selectedItemIds.size > 0 || selectedCategoryIds.size > 0;

  const clearSelection = useCallback(() => {
    setSelectedItemIds(new Set());
    setSelectedCategoryIds(new Set());
  }, []);

  const toggleItemSelection = useCallback((id: string) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleCategorySelection = useCallback((id: string) => {
    setSelectedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleAllItemsInCategory = useCallback((_categoryId: string, categoryItems: InventoryItem[]) => {
    const ids = categoryItems.map((i) => i.id);
    const allSelected = ids.every((id) => selectedItemIds.has(id));
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (allSelected) { ids.forEach((id) => next.delete(id)); }
      else { ids.forEach((id) => next.add(id)); }
      return next;
    });
  }, [selectedItemIds]);

  return {
    selectedItemIds,
    selectedCategoryIds,
    hasSelection,
    clearSelection,
    toggleItemSelection,
    toggleCategorySelection,
    toggleAllItemsInCategory,
    setSelectedItemIds,
    setSelectedCategoryIds,
  };
}
