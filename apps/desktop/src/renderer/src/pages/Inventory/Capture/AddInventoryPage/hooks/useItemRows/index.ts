import { useState, useCallback, useEffect, useMemo } from 'react';
import type { ItemRow } from '../../components/ItemsSection/types';
import type { InventoryItem } from '../../../CapturedInventory/types';

function emptyItemRow(): ItemRow {
  return { id: crypto.randomUUID(), name: '', categoryId: '', type: '', unitOfMeasureId: '' };
}

type AddItemFn = (item: {
  name: string;
  categoryId: string;
  type: string;
  unitOfMeasureId: string | null;
  entityId: string;
}) => void;

function submitValidRows(
  itemRows: ItemRow[],
  itemDupes: Set<string>,
  entityId: string,
  addItem: AddItemFn,
): void {
  const valid = itemRows.filter(
    (r) => r.name.trim() && r.categoryId && r.unitOfMeasureId && !itemDupes.has(r.id),
  );
  valid.forEach((r) =>
    addItem({
      name: r.name.trim(),
      categoryId: r.categoryId,
      type: r.type,
      unitOfMeasureId: r.unitOfMeasureId || null,
      entityId,
    }),
  );
}

function markItemDupe(
  dupes: Set<string>,
  seen: Map<string, string>,
  existing: Set<string>,
  row: ItemRow,
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

function buildItemDupes(itemRows: ItemRow[], items: InventoryItem[]): Set<string> {
  const existing = new Set(items.map((i) => i.name.trim().toLowerCase()));
  const seen = new Map<string, string>();
  const dupes = new Set<string>();
  for (const row of itemRows) {
    markItemDupe(dupes, seen, existing, row);
  }
  return dupes;
}

type Params = {
  items: InventoryItem[];
  entityId: string | null;
  addItem: AddItemFn;
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

  const itemDupes = useMemo(() => buildItemDupes(itemRows, items), [itemRows, items]);

  const submitItems = useCallback(() => {
    if (!entityId) return;
    submitValidRows(itemRows, itemDupes, entityId, addItem);
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
