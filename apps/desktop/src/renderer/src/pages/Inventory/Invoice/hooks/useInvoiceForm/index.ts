import { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useInventory } from '@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext';
import { invoiceService } from '@/services/invoice';
import type { ProcessReceiptLine } from '../../types';
import { getProcessLineComputed, DEFAULT_VAT_RATE } from '../../types';
import { createEmptyLine } from '../../utils/createEmptyLine';
import { loadDraft, useDraftPersistence } from '../useDraftPersistence';
import { useLineManager } from '../useLineManager';
import { useInvoiceSummary } from '../useInvoiceSummary';

export function useInvoiceForm() {
  const { items, categories, units, addCategory, addItem } = useInventory();
  const location = useLocation();

  const templateLines = (location.state as { templateLines?: ProcessReceiptLine[] } | null)
    ?.templateLines;
  const isReused = !!templateLines;

  const initialLines = (() => {
    if (templateLines && templateLines.length > 0) return templateLines;
    const draft = loadDraft();
    return draft?.lines.length ? draft.lines : [createEmptyLine()];
  })();

  const [invoiceNumber, setInvoiceNumber] = useState<string>(() =>
    isReused ? '' : (loadDraft()?.invoiceNumber ?? ''),
  );
  const [invoiceDate, setInvoiceDate] = useState<string>(() =>
    isReused ? '' : (loadDraft()?.invoiceDate ?? ''),
  );
  const [supplierId, setSupplierId] = useState<string>('');
  const [vatRate, setVatRateState] = useState<number>(
    () => initialLines[0]?.vatRate ?? DEFAULT_VAT_RATE,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [expandedResultLineIds, setExpandedResultLineIds] = useState<Set<string>>(new Set());
  const [reuseNoticeDismissed, setReuseNoticeDismissed] = useState(false);

  const {
    lines,
    setLines,
    addLine: addLineRaw,
    removeLine,
    updateLine,
    setAllVatMode,
  } = useLineManager(initialLines);

  const addLine = useCallback(
    (focusField = 'item') => addLineRaw(focusField, vatRate),
    [addLineRaw, vatRate],
  );

  const setVatRate = useCallback(
    (rate: number) => {
      setVatRateState(rate);
      setLines((prev) => prev.map((l) => ({ ...l, vatRate: rate })));
    },
    [setLines],
  );

  const { clearDraft } = useDraftPersistence(lines, invoiceNumber, invoiceDate, isReused);

  const { invoiceSummary, validLines, itemsWithCategory, itemMetaMap } = useInvoiceSummary(
    lines,
    items,
    categories,
  );

  const canSave =
    validLines.length > 0 &&
    !lines.some(
      (l) => (l.itemId && Number(l.quantity) <= 0) || (!l.itemId && Number(l.quantity) > 0),
    );

  const toggleResultRow = useCallback((lineId: string) => {
    setExpandedResultLineIds((prev) => {
      const next = new Set(prev);
      if (next.has(lineId)) next.delete(lineId);
      else next.add(lineId);
      return next;
    });
  }, []);

  const clearForm = useCallback(() => {
    setLines([createEmptyLine()]);
    setInvoiceNumber('');
    setInvoiceDate('');
    setSupplierId('');
    setExpandedResultLineIds(new Set());
    clearDraft();
  }, [clearDraft, setLines]);

  const isDirty =
    lines.some((l) => l.itemId) || !!invoiceNumber.trim() || !!invoiceDate || !!supplierId;

  const handleSave = useCallback(async () => {
    if (!canSave) {
      setSaveError('Complete all rows before saving — each row needs an item and quantity.');
      return;
    }
    setSaveError(null);
    setIsSaving(true);
    try {
      await invoiceService.saveInvoice({
        id: window.crypto.randomUUID(),
        supplierId: supplierId || null,
        invoiceNumber: invoiceNumber.trim() || null,
        invoiceDate: invoiceDate ? new Date(invoiceDate) : null,
        lines: validLines.map((line) => {
          const computed = getProcessLineComputed(line);
          return {
            id: line.id,
            itemId: line.itemId,
            itemNameSnapshot: itemMetaMap.get(line.itemId)?.name ?? '',
            quantity: Number(line.quantity),
            vatMode: line.vatMode,
            vatRate: line.vatRate,
            totalVatExclude: computed.netTotal,
          };
        }),
      });
      clearForm();
      toast.success('Invoice saved');
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to save invoice');
    } finally {
      setIsSaving(false);
    }
  }, [canSave, validLines, invoiceNumber, invoiceDate, supplierId, itemMetaMap, clearForm]);

  return {
    units,
    categories,
    addCategory,
    addItem,
    lines,
    invoiceNumber,
    setInvoiceNumber,
    invoiceDate,
    setInvoiceDate,
    supplierId,
    setSupplierId,
    vatRate,
    setVatRate,
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
    setAllVatMode,
    clearForm,
    isDirty,
    canSave,
    itemsWithCategory,
    itemMetaMap,
    invoiceSummary,
    validLines,
    handleSave,
  };
}
