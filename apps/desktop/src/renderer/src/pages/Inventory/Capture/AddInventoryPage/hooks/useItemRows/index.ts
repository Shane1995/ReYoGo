import { useState, useCallback, useEffect, useMemo } from 'react';
import type { ItemRow } from '../../components/ItemsSection';
import type { InventoryItem } from '../../../CapturedInventory/types';

function emptyItemRow(): ItemRow {
  return { id: crypto.randomUUID(), name: '', categoryId: '', type: '', unitOfMeasureId: '' };
}

type Params = {
  items: InventoryItem[];
  entityId: string | null;
  addItem: (item: {
    name: string;
    categoryId: string;
    type: string;
    unitOfMeasureId: string | null;
    entityId: string;
  }) => void;
};

export function useItemRows({ items, entityId, addItem }: Params) {
  const [itemRows, setItemRows] = useState<ItemRow[]>([emptyItemRow()]);
  const [lastFocusId, setLastFocusId] = useState<string | null>(null);

  useEffect(() => {
    if (!lastFocusId) return;
    const t = setTimeout(() => {
      document.getElementById(lastFocusId)?.focus();
      setLastFocusId(null);
    }, 50);
    return () => clearTimeout(t);
  }, [lastFocusId]);

  const addItemRow = useCallback(() => {
    const r = emptyItemRow();
    setItemRows((prev) => [...prev, r]);
    setLastFocusId(`row-name-${r.id}`);
  }, []);

  const removeItemRow = useCallback(
    (id: string) => setItemRows((p) => p.filter((r) => r.id !== id)),
    [],
  );

  const updateItemRow = useCallback(
    (id: string, u: Partial<ItemRow>) =>
      setItemRows((p) => p.map((r) => (r.id === id ? { ...r, ...u } : r))),
    [],
  );

  const itemDupes = useMemo(() => {
    const existing = new Set(items.map((i) => i.name.trim().toLowerCase()));
    const seen = new Map<string, string>();
    const dupes = new Set<string>();
    for (const row of itemRows) {
      const key = row.name.trim().toLowerCase();
      if (!key) continue;
      if (existing.has(key)) {
        dupes.add(row.id);
      } else if (seen.has(key)) {
        dupes.add(row.id);
        dupes.add(seen.get(key)!);
      } else seen.set(key, row.id);
    }
    return dupes;
  }, [itemRows, items]);

  const submitItems = useCallback(() => {
    if (!entityId) return;
    const valid = itemRows.filter(
      (r) => r.name.trim() && r.categoryId && r.unitOfMeasureId && !itemDupes.has(r.id),
    );
    if (!valid.length) return;
    valid.forEach((r) =>
      addItem({
        name: r.name.trim(),
        categoryId: r.categoryId,
        type: r.type,
        unitOfMeasureId: r.unitOfMeasureId || null,
        entityId,
      }),
    );
    setItemRows([emptyItemRow()]);
  }, [itemRows, itemDupes, addItem, entityId]);

  const namedItemRows = itemRows.filter((r) => r.name.trim());
  const canSubmitItems =
    !!entityId &&
    namedItemRows.some((r) => r.categoryId && r.unitOfMeasureId && !itemDupes.has(r.id));
  const hasIncompleteItemRows = namedItemRows.some((r) => !r.categoryId || !r.unitOfMeasureId);

  const clearItemRows = useCallback(() => setItemRows([emptyItemRow()]), []);

  return {
    itemRows,
    itemDupes,
    canSubmitItems,
    hasIncompleteItemRows,
    addItemRow,
    removeItemRow,
    updateItemRow,
    submitItems,
    clearItemRows,
  };
}
