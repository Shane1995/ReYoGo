import { useState, useCallback } from "react";
import type { IUnitOfMeasure } from "@shared/types/contract/setup";
import type { IInventoryCategory, IInventoryItem } from "@shared/types/contract/inventory";
import type { ReviewResult } from "@/components/CsvImport/review";
import { setupService } from "@/services/setup";
import { inventoryService } from "@/services/inventory";
import { DEFAULT_GOOD_TYPES, DEFAULT_UNITS } from "../../utils/types";
import { createEmptyCategory, createEmptyItem } from "../../utils/createEmpty";
import type { Step, PendingCategory, PendingItem } from "../../utils/types";

export function useSetupWizard(onComplete: () => void) {
  const [step, setStep] = useState<Step>("welcome");
  const [goodTypes, setGoodTypes] = useState<string[]>(DEFAULT_GOOD_TYPES);
  const [units, setUnits] = useState<IUnitOfMeasure[]>(DEFAULT_UNITS);
  const [categories, setCategories] = useState<PendingCategory[]>([
    createEmptyCategory(DEFAULT_GOOD_TYPES[0]),
  ]);
  const [items, setItems] = useState<PendingItem[]>([createEmptyItem()]);
  const [saving, setSaving] = useState(false);

  const goTo = (s: Step) => setStep(s);

  const handleImport = useCallback(
    (_parsed: unknown, review: ReviewResult) => {
      const selectedUnits = review.units.filter((u) => u.selected && u.status === "new");
      const existingUnitNames = new Set(units.map((u) => u.name.toLowerCase()));
      const newUnitObjects = selectedUnits
        .filter((u) => !existingUnitNames.has(u.name.toLowerCase()))
        .map((u) => ({ id: crypto.randomUUID(), name: u.name }));

      const unitNameToId = new Map<string, string>([
        ...units.map((u) => [u.name.toLowerCase(), u.id] as [string, string]),
        ...newUnitObjects.map((u) => [u.name.toLowerCase(), u.id] as [string, string]),
      ]);

      if (newUnitObjects.length > 0) {
        setUnits((prev) => [...prev, ...newUnitObjects]);
      }

      const selectedCats = review.categories.filter((c) => c.selected && c.status !== "exists");
      if (selectedCats.length > 0) {
        setCategories((prev) => {
          const existingNames = new Set(prev.map((c) => c.name.toLowerCase()).filter(Boolean));
          const newOnes = selectedCats
            .filter((c) => !existingNames.has(c.name.toLowerCase()))
            .map((c) => ({ id: crypto.randomUUID(), name: c.name, type: c.type }));
          const withContent = prev.filter((c) => c.name.trim());
          return [...withContent, ...newOnes, createEmptyCategory(goodTypes[0] ?? "")];
        });
      }

      const selectedItems = review.items.filter((i) => i.selected && i.status === "new");
      if (selectedItems.length > 0) {
        setCategories((currentCats) => {
          const catMap = new Map(currentCats.map((c) => [c.name.toLowerCase(), c.id]));
          selectedCats.forEach((c) => {
            if (!catMap.has(c.name.toLowerCase())) catMap.set(c.name.toLowerCase(), c.id);
          });
          setItems((prev) => {
            const existingNames = new Set(prev.map((i) => i.name.toLowerCase()).filter(Boolean));
            const newOnes = selectedItems
              .filter((i) => !existingNames.has(i.name.toLowerCase()))
              .map((i) => ({
                id: crypto.randomUUID(),
                name: i.name,
                categoryId: catMap.get(i.categoryName.toLowerCase()) ?? "",
                unitId: i.unit ? (unitNameToId.get(i.unit.toLowerCase()) ?? "") : "",
              }));
            const withContent = prev.filter((i) => i.name.trim());
            return [...withContent, ...newOnes, createEmptyItem()];
          });
          return currentCats;
        });
      }
    },
    [units, goodTypes]
  );

  const handleFinish = useCallback(async () => {
    setSaving(true);
    try {
      await setupService.setGoodTypes(goodTypes);

      for (const unit of units) {
        await setupService.upsertUnit(unit);
      }

      const validCategories = categories.filter((c) => c.name.trim());
      const categoryMap = new Map<string, IInventoryCategory>();
      for (const cat of validCategories) {
        const category: IInventoryCategory = { id: cat.id, name: cat.name.trim(), type: cat.type };
        await inventoryService.upsertCategory(category);
        categoryMap.set(cat.id, category);
      }

      const validItems = items.filter((i) => i.name.trim() && i.categoryId);
      for (const item of validItems) {
        const cat = categoryMap.get(item.categoryId);
        if (!cat) continue;
        const unit = units.find((u) => u.id === item.unitId);
        const inventoryItem: IInventoryItem = {
          id: item.id,
          name: item.name.trim(),
          categoryId: item.categoryId,
          type: cat.type,
          unitOfMeasure: unit?.name,
        };
        await inventoryService.upsertItem(inventoryItem);
      }

      await setupService.complete();
      onComplete();
    } catch (err) {
      console.error("Setup failed", err);
      setSaving(false);
    }
  }, [goodTypes, units, categories, items, onComplete]);

  return {
    step,
    goodTypes,
    setGoodTypes,
    units,
    setUnits,
    categories,
    setCategories,
    items,
    setItems,
    saving,
    goTo,
    handleImport,
    handleFinish,
  };
}
