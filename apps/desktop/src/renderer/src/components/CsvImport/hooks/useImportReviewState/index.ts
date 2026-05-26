import { useState, useCallback, useMemo } from 'react';
import { InventoryType } from '@reyogo/types';
import type { ReviewResult, ReviewUnit, ReviewCategory, ReviewItem } from '../../review';
import { UNIT_STATUS, CATEGORY_STATUS, ITEM_STATUS } from '../../review';

export function useImportReviewState(initial: ReviewResult) {
  const [units, setUnits] = useState<ReviewUnit[]>(initial.units);
  const [categories, setCategories] = useState<ReviewCategory[]>(initial.categories);
  const [items, setItems] = useState<ReviewItem[]>(initial.items);

  const typeWarningCount = useMemo(
    () => categories.filter((c) => c.typeWarning && c.status !== CATEGORY_STATUS.Exists).length,
    [categories],
  );

  const fixCategoryType = useCallback((id: string, type: InventoryType) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, type, typeWarning: false } : c)),
    );
  }, []);

  const toggleUnit = useCallback((name: string) => {
    setUnits((prev) =>
      prev.map((u) =>
        u.name === name && u.status !== UNIT_STATUS.Exists ? { ...u, selected: !u.selected } : u,
      ),
    );
  }, []);

  const toggleCategory = useCallback((id: string) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === id && c.status !== CATEGORY_STATUS.Exists ? { ...c, selected: !c.selected } : c,
      ),
    );
  }, []);

  const toggleItem = useCallback((name: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.name === name && i.status === ITEM_STATUS.New ? { ...i, selected: !i.selected } : i,
      ),
    );
  }, []);

  const assignCategory = useCallback(
    (itemName: string, catName: string) => {
      setItems((prev) =>
        prev.map((i) => {
          if (i.name !== itemName) return i;
          if (catName) {
            return { ...i, categoryName: catName, status: ITEM_STATUS.New, selected: true };
          }
          const original = initial.items.find((ii) => ii.name === itemName);
          return {
            ...i,
            categoryName: original?.unresolvedReason ?? i.categoryName,
            status: ITEM_STATUS.Unresolved,
            selected: false,
          };
        }),
      );
    },
    [initial.items],
  );

  const selectedNew =
    units.filter((u) => u.selected && u.status === UNIT_STATUS.New).length +
    categories.filter((c) => c.selected && c.status === CATEGORY_STATUS.New).length +
    items.filter((i) => i.selected && i.status === ITEM_STATUS.New).length;

  const existsCount =
    units.filter((u) => u.status === UNIT_STATUS.Exists).length +
    categories.filter((c) => c.status === CATEGORY_STATUS.Exists).length +
    items.filter((i) => i.status === ITEM_STATUS.Exists).length;

  const unresolvedCount = items.filter((i) => i.status === ITEM_STATUS.Unresolved).length;

  const buildResult = useCallback(
    (): ReviewResult => ({
      units,
      categories,
      items,
      parseErrors: initial.parseErrors,
      availableCategories: initial.availableCategories,
      counts: initial.counts,
    }),
    [units, categories, items, initial],
  );

  return {
    units,
    categories,
    items,
    typeWarningCount,
    selectedNew,
    existsCount,
    unresolvedCount,
    fixCategoryType,
    toggleUnit,
    toggleCategory,
    toggleItem,
    assignCategory,
    buildResult,
  };
}
