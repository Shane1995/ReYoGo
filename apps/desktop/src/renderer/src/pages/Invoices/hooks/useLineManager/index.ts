import { useState, useCallback, useEffect, useRef } from 'react';
import type { ProcessReceiptLine } from '../../types';
import { createEmptyLine } from '../../utils/createEmptyLine';

export function useLineManager(initialLines?: ProcessReceiptLine[]) {
  const [lines, setLines] = useState<ProcessReceiptLine[]>(
    () => initialLines ?? [createEmptyLine()],
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

  const addLine = useCallback((focusField = 'item') => {
    const newLine = createEmptyLine();
    pendingFocusRef.current = { id: newLine.id, field: focusField };
    setLines((prev) => [...prev, newLine]);
  }, []);

  const removeLine = useCallback((id: string) => {
    setLines((prev) => {
      const next = prev.filter((l) => l.id !== id);
      return next.length > 0 ? next : [createEmptyLine()];
    });
  }, []);

  const updateLine = useCallback((id: string, updates: Partial<ProcessReceiptLine>) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  }, []);

  return { lines, setLines, addLine, removeLine, updateLine };
}
