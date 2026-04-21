import { useState, useCallback, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { InvoicesIPC } from "@shared/types/ipc";
import { useInventory } from "@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext";
import type { ProcessReceiptLine } from "../../types";
import { getProcessLineComputed } from "../../types";
import { createEmptyLine } from "../../utils/createEmptyLine";

export function useInvoiceForm() {
  const { items, categories, units, addCategory, addItem } = useInventory();
  const location = useLocation();

  const [lines, setLines] = useState<ProcessReceiptLine[]>(() => {
    const template = (location.state as { templateLines?: ProcessReceiptLine[] } | null)?.templateLines;
    return template && template.length > 0 ? template : [createEmptyLine()];
  });
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [expandedResultLineIds, setExpandedResultLineIds] = useState<Set<string>>(new Set());
  const [reuseNoticeDismissed, setReuseNoticeDismissed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastAddedLineId, setLastAddedLineId] = useState<string | null>(null);

  const isReused = !!(location.state as { templateLines?: ProcessReceiptLine[] } | null)?.templateLines;

  useEffect(() => {
    if (!lastAddedLineId) return;
    const id = `invoice-item-${lastAddedLineId}`;
    const t = setTimeout(() => {
      document.getElementById(id)?.focus();
      setLastAddedLineId(null);
    }, 50);
    return () => clearTimeout(t);
  }, [lastAddedLineId]);

  const toggleResultRow = useCallback((lineId: string) => {
    setExpandedResultLineIds((prev) => {
      const next = new Set(prev);
      if (next.has(lineId)) next.delete(lineId);
      else next.add(lineId);
      return next;
    });
  }, []);

  const addLine = useCallback(() => {
    const newLine = createEmptyLine();
    setLines((prev) => [...prev, newLine]);
    setLastAddedLineId(newLine.id);
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

  const itemsWithCategory = useMemo(
    () =>
      items.map((item) => {
        const cat = categories.find((c) => c.id === item.categoryId);
        return { ...item, categoryName: cat?.name ?? "", typeLabel: cat?.type ?? "" };
      }),
    [items, categories]
  );

  const itemMetaMap = useMemo(
    () => new Map(itemsWithCategory.map((i) => [i.id, i])),
    [itemsWithCategory]
  );

  const invoiceSummary = useMemo(
    () =>
      lines.reduce(
        (acc, line) => {
          const c = getProcessLineComputed(line);
          return {
            lineCount: acc.lineCount + (line.itemId ? 1 : 0),
            subtotal: acc.subtotal + c.netTotal,
            totalVat: acc.totalVat + c.vatAmount,
            grandTotal: acc.grandTotal + c.grossTotal,
          };
        },
        { lineCount: 0, subtotal: 0, totalVat: 0, grandTotal: 0 }
      ),
    [lines]
  );

  const validLines = useMemo(
    () => lines.filter((l) => l.itemId && Number(l.quantity) > 0 && (l.totalVatExclude ?? 0) >= 0),
    [lines]
  );

  const handleSave = useCallback(async () => {
    if (validLines.length === 0) {
      setSaveError("Add at least one line with an item, quantity, and total.");
      return;
    }
    setSaveError(null);
    setIsSaving(true);
    try {
      const payload = {
        id: crypto.randomUUID(),
        lines: validLines.map((line) => {
          const item = items.find((i) => i.id === line.itemId);
          const computed = getProcessLineComputed(line);
          return {
            id: line.id,
            itemId: line.itemId,
            itemNameSnapshot: item?.name ?? "Unknown",
            unitOfMeasure: item?.unitOfMeasure ?? null,
            quantity: Number(line.quantity) || 0,
            vatMode: line.vatMode,
            vatRate: line.vatRate,
            totalVatExclude: computed.netTotal,
          };
        }),
      };
      await window.electronAPI.ipcRenderer.invoke(InvoicesIPC.SAVE_INVOICE, payload);
      setLines([createEmptyLine()]);
      setExpandedResultLineIds(new Set());
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to save invoice");
    } finally {
      setIsSaving(false);
    }
  }, [validLines, items]);

  return {
    units,
    categories,
    addCategory,
    addItem,
    lines,
    categoryModalOpen,
    setCategoryModalOpen,
    itemModalOpen,
    setItemModalOpen,
    expandedResultLineIds,
    isReused,
    reuseNoticeDismissed,
    setReuseNoticeDismissed,
    isSaving,
    saveError,
    toggleResultRow,
    addLine,
    removeLine,
    updateLine,
    itemsWithCategory,
    itemMetaMap,
    invoiceSummary,
    validLines,
    handleSave,
  };
}
