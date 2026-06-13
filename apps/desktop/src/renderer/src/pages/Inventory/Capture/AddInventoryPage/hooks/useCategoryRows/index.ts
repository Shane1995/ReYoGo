import { useState, useCallback, useEffect, useMemo } from 'react';
import { InventoryType } from '@reyogo/types';
import type { CategoryRow } from '../../components/CategoriesSection/types';
import type { InventoryCategory } from '../../../CapturedInventory/types';

function emptyCategoryRow(): CategoryRow {
  return { id: crypto.randomUUID(), name: '', type: InventoryType.Food };
}

type Params = {
  categories: InventoryCategory[];
  addCategory: (cat: { name: string; type: string }) => void;
};

function markDupe(
  dupes: Set<string>,
  seen: Map<string, string>,
  existing: Set<string>,
  row: CategoryRow,
): void {
  const key = row.name.trim().toLowerCase();
  if (!key) return;
  if (existing.has(key)) {
    dupes.add(row.id);
    return;
  }
  const seenId = seen.get(key);
  if (seenId) {
    dupes.add(row.id);
    dupes.add(seenId);
    return;
  }
  seen.set(key, row.id);
}

function computeDupes(catRows: CategoryRow[], categories: InventoryCategory[]): Set<string> {
  const existing = new Set(categories.map((c) => c.name.trim().toLowerCase()));
  const seen = new Map<string, string>();
  const dupes = new Set<string>();
  for (const row of catRows) {
    markDupe(dupes, seen, existing, row);
  }
  return dupes;
}

export function useCategoryRows({ categories, addCategory }: Params) {
  const [catRows, setCatRows] = useState<CategoryRow[]>([emptyCategoryRow()]);
  const [lastFocusId, setLastFocusId] = useState<string | null>(null);

  useEffect(() => {
    if (!lastFocusId) return;
    const t = setTimeout(() => {
      document.getElementById(lastFocusId)?.focus();
      setLastFocusId(null);
    }, 50);
    return () => clearTimeout(t);
  }, [lastFocusId]);

  const addCatRow = useCallback(() => {
    const r = emptyCategoryRow();
    setCatRows((prev) => [...prev, r]);
    setLastFocusId(`row-name-${r.id}`);
  }, []);

  const removeCatRow = useCallback(
    (id: string) => setCatRows((p) => p.filter((r) => r.id !== id)),
    [],
  );

  const updateCatRow = useCallback(
    (id: string, u: Partial<CategoryRow>) =>
      setCatRows((p) => p.map((r) => (r.id === id ? { ...r, ...u } : r))),
    [],
  );

  const catDupes = useMemo(() => computeDupes(catRows, categories), [catRows, categories]);

  const submitCats = useCallback(() => {
    const valid = catRows.filter((r) => r.name.trim() && !catDupes.has(r.id));
    if (!valid.length) return;
    valid.forEach((r) => addCategory({ name: r.name.trim(), type: r.type }));
    setCatRows([emptyCategoryRow()]);
  }, [catRows, catDupes, addCategory]);

  const canSubmitCats = catRows.some((r) => r.name.trim() && !catDupes.has(r.id));

  const clearCatRows = useCallback(() => setCatRows([emptyCategoryRow()]), []);

  return {
    catRows,
    catDupes,
    canSubmitCats,
    addCatRow,
    removeCatRow,
    updateCatRow,
    submitCats,
    clearCatRows,
  };
}
