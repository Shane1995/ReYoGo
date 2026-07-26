import { useState, useCallback, useEffect, useRef } from 'react';
import { VatMode } from '@reyogo/types';
import type { ProcessReceiptLine } from '../../types';
import { createEmptyLine } from '../../utils/createEmptyLine';

export function newLine(vatMode?: VatMode): ProcessReceiptLine {
  return { ...createEmptyLine(), isVatable: vatMode === VatMode.Exclusive };
}

export function useLineManager(initialLines?: ProcessReceiptLine[], vatMode?: VatMode) {
  const [lines, setLines] = useState<ProcessReceiptLine[]>(
    () => initialLines ?? [newLine(vatMode)],
  );
  const pendingFocusRef = useRef<{ id: string; field: string } | null>(null);

  const focusPendingLine = useCallback(() => {
    if (!pendingFocusRef.current) return;
    const { id, field } = pendingFocusRef.current;
    const el = document.getElementById(`invoice-${field}-${id}`);
    if (el) {
      el.focus();
      pendingFocusRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!pendingFocusRef.current) return;
    const t = setTimeout(focusPendingLine, 50);
    return () => clearTimeout(t);
  }, [lines, focusPendingLine]);

  const addLine = useCallback(
    (focusField = 'item') => {
      const line = newLine(vatMode);
      pendingFocusRef.current = { id: line.id, field: focusField };
      setLines((prev) => [...prev, line]);
    },
    [vatMode],
  );

  const removeLine = useCallback(
    (id: string) => {
      setLines((prev) => {
        const idx = prev.findIndex((l) => l.id === id);
        const next = prev.filter((l) => l.id !== id);
        const remaining = next.length > 0 ? next : [newLine(vatMode)];
        const focusTarget = next.length > 0 ? remaining[Math.max(0, idx - 1)] : remaining[0];
        if (focusTarget) {
          pendingFocusRef.current = { id: focusTarget.id, field: 'item' };
        }
        return remaining;
      });
    },
    [vatMode],
  );

  const updateLine = useCallback((id: string, updates: Partial<ProcessReceiptLine>) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  }, []);

  return { lines, setLines, addLine, removeLine, updateLine };
}
