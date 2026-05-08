import { useState, useCallback, useMemo } from 'react';
import type { ReviewResult, ReviewUnit, ReviewCategory, ReviewItem } from '../../review';

export function useImportReviewState(initial: ReviewResult) {
  const [units, setUnits] = useState<ReviewUnit[]>(initial.units);
  const [categories, setCategories] = useState<ReviewCategory[]>(initial.categories);
  const [items, setItems] = useState<ReviewItem[]>(initial.items);

  const goodTypes = initial.goodTypes ?? [];

  const typeWarningCount = useMemo(
    () => categories.filter((c) => c.typeWarning && c.status !== 'exists').length,
    [categories]
  );

  const fixCategoryType = useCallback((id: string, type: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, type, typeWarning: false } : c))
    );
  }, []);

  const toggleUnit = useCallback((name: string) => {
    setUnits((prev) =>
      prev.map((u) => (u.name === name && u.status !== 'exists' ? { ...u, selected: !u.selected } : u))
    );
  }, []);

  const toggleCategory = useCallback((id: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id && c.status !== 'exists' ? { ...c, selected: !c.selected } : c))
    );
  }, []);

  const toggleItem = useCallback((name: string) => {
    setItems((prev) =>
      prev.map((i) => (i.name === name && i.status === 'new' ? { ...i, selected: !i.selected } : i))
    );
  }, []);

  const assignCategory = useCallback(
    (itemName: string, catName: string) => {
      setItems((prev) =>
        prev.map((i) => {
          if (i.name !== itemName) return i;
          if (catName) {
            return { ...i, categoryName: catName, status: 'new', selected: true };
          }
          const original = initial.items.find((ii) => ii.name === itemName);
          return {
            ...i,
            categoryName: original?.unresolvedReason ?? i.categoryName,
            status: 'unresolved',
            selected: false,
          };
        })
      );
    },
    [initial.items]
  );

  const selectedNew =
    units.filter((u) => u.selected && u.status === 'new').length +
    categories.filter((c) => c.selected && c.status === 'new').length +
    items.filter((i) => i.selected && i.status === 'new').length;

  const existsCount =
    units.filter((u) => u.status === 'exists').length +
    categories.filter((c) => c.status === 'exists').length +
    items.filter((i) => i.status === 'exists').length;

  const unresolvedCount = items.filter((i) => i.status === 'unresolved').length;

  const buildResult = useCallback(
    (): ReviewResult => ({
      units,
      categories,
      items,
      parseErrors: initial.parseErrors,
      availableCategories: initial.availableCategories,
      goodTypes: initial.goodTypes,
      counts: initial.counts,
    }),
    [units, categories, items, initial]
  );

  return {
    units,
    categories,
    items,
    goodTypes,
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
