import { useCallback, useEffect, useMemo, useState } from 'react';
import type { IStocktakeSessionWithLines } from '@reyogo/types';
import type { CountEntry } from './types';

function entriesFromSession(
  session: IStocktakeSessionWithLines | null,
): Record<string, CountEntry> {
  if (!session) return {};
  const entries: Record<string, CountEntry> = {};
  for (const line of session.lines) {
    entries[line.inventoryItemId] = {
      id: line.id,
      inventoryItemId: line.inventoryItemId,
      countedQty: line.countedQty,
      notes: line.notes,
    };
  }
  return entries;
}

export function useCountEntries(session: IStocktakeSessionWithLines | null) {
  const [entries, setEntries] = useState<Record<string, CountEntry>>(() =>
    entriesFromSession(session),
  );

  useEffect(() => {
    setEntries(entriesFromSession(session));
  }, [session]);

  const setQty = useCallback((itemId: string, qty: number | null) => {
    setEntries((prev) => {
      if (qty === null) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      const existing = prev[itemId];
      return {
        ...prev,
        [itemId]: {
          id: existing?.id ?? crypto.randomUUID(),
          inventoryItemId: itemId,
          countedQty: qty,
          notes: existing?.notes,
        },
      };
    });
  }, []);

  const countedQtyByItem = useMemo(
    () => Object.fromEntries(Object.entries(entries).map(([itemId, e]) => [itemId, e.countedQty])),
    [entries],
  );

  const lines = useMemo(() => Object.values(entries), [entries]);

  return { countedQtyByItem, lines, setQty };
}
