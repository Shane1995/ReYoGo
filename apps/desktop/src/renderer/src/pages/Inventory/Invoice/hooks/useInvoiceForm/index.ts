import { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useInventory } from '@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext';
import { invoiceService } from '@/services/invoice';
import type { ProcessReceiptLine, VatMode } from '../../types';
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
  const [vatMode, setVatModeState] = useState<VatMode>(() =>
    isReused ? 'exclusive' : (loadDraft()?.vatMode ?? 'exclusive'),
  );
  const [vatRate, setVatRateState] = useState<number>(() =>
    isReused ? DEFAULT_VAT_RATE : (loadDraft()?.vatRate ?? DEFAULT_VAT_RATE),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [expandedResultLineIds, setExpandedResultLineIds] = useState<Set<string>>(new Set());
  const [reuseNoticeDismissed, setReuseNoticeDismissed] = useState(false);

  const { lines, setLines, addLine, removeLine, updateLine } = useLineManager(initialLines);

  const setVatMode = useCallback((mode: VatMode) => {
    setVatModeState(mode);
  }, []);

  const setVatRate = useCallback((rate: number) => {
    setVatRateState(rate);
  }, []);

  const { clearDraft } = useDraftPersistence(
    lines,
    invoiceNumber,
    invoiceDate,
    vatMode,
    vatRate,
    isReused,
  );

  const { invoiceSummary, validLines, itemsWithCategory, itemMetaMap } = useInvoiceSummary(
    lines,
    items,
    categories,
    vatMode,
    vatRate,
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
    setVatModeState('exclusive');
    setVatRateState(DEFAULT_VAT_RATE);
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
        vatMode,
        vatRate,
        lines: validLines.map((line) => {
          const computed = getProcessLineComputed(line, vatMode, vatRate);
          return {
            id: line.id,
            itemId: line.itemId,
            itemNameSnapshot: itemMetaMap.get(line.itemId)?.name ?? '',
            quantity: Number(line.quantity),
            isVatable: line.isVatable,
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
  }, [
    canSave,
    validLines,
    invoiceNumber,
    invoiceDate,
    supplierId,
    vatMode,
    vatRate,
    itemMetaMap,
    clearForm,
  ]);

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
    vatMode,
    setVatMode,
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
