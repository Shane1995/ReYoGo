import { useState, useCallback, useMemo } from 'react';
import { InventoryType } from '@reyogo/types';
import type { ReviewResult, ReviewUnit, ReviewCategory, ReviewItem } from '../../review';
import { ReviewStatus } from '../../review';
import { resolveCategoryAssignment } from '../../utils/resolveCategoryAssignment';

export function useImportReviewState(initial: ReviewResult) {
  const [units, setUnits] = useState<ReviewUnit[]>(initial.units);
  const [categories, setCategories] = useState<ReviewCategory[]>(initial.categories);
  const [items, setItems] = useState<ReviewItem[]>(initial.items);

  const typeWarningCount = useMemo(
    () => categories.filter((c) => c.typeWarning && c.status !== ReviewStatus.Exists).length,
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
        u.name === name && u.status !== ReviewStatus.Exists ? { ...u, selected: !u.selected } : u,
      ),
    );
  }, []);

  const toggleCategory = useCallback((id: string) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === id && c.status !== ReviewStatus.Exists ? { ...c, selected: !c.selected } : c,
      ),
    );
  }, []);

  const toggleItem = useCallback((name: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.name === name && i.status === ReviewStatus.New ? { ...i, selected: !i.selected } : i,
      ),
    );
  }, []);

  const assignCategory = useCallback(
    (itemName: string, catName: string) => {
      setItems((prev) =>
        prev.map((i) => resolveCategoryAssignment(i, itemName, catName, initial.items)),
      );
    },
    [initial.items],
  );

  const selectedNew =
    units.filter((u) => u.selected && u.status === ReviewStatus.New).length +
    categories.filter((c) => c.selected && c.status === ReviewStatus.New).length +
    items.filter((i) => i.selected && i.status === ReviewStatus.New).length;

  const existsCount =
    units.filter((u) => u.status === ReviewStatus.Exists).length +
    categories.filter((c) => c.status === ReviewStatus.Exists).length +
    items.filter((i) => i.status === ReviewStatus.Exists).length;

  const unresolvedCount = items.filter((i) => i.status === ReviewStatus.Unresolved).length;

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
