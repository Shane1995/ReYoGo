import { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useInventory } from '@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext';
import { useEntities } from '@/Context/EntityContext';
import { invoiceService } from '@/services/invoice';
import type { ProcessReceiptLine, VatMode } from '../../types';
import { getProcessLineComputed } from '../../types';
import { createEmptyLine } from '../../utils/createEmptyLine';
import { loadDraft, useDraftPersistence } from '../useDraftPersistence';
import { useLineManager } from '../useLineManager';
import { useInvoiceSummary } from '../useInvoiceSummary';

export function useInvoiceForm() {
  const { items, categories, units, addCategory, addItem } = useInventory();
  const { entities } = useEntities();
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
  const [entityId, setEntityId] = useState<string>(() => {
    return localStorage.getItem('last-invoice-entity') ?? entities[0]?.id ?? '';
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [expandedResultLineIds, setExpandedResultLineIds] = useState<Set<string>>(new Set());
  const [reuseNoticeDismissed, setReuseNoticeDismissed] = useState(false);

  const { lines, setLines, addLine, removeLine, updateLine } = useLineManager(initialLines);

  const setVatMode = useCallback((mode: VatMode) => {
    setVatModeState(mode);
  }, []);

  const vatRate = entities.find((e) => e.id === entityId)?.defaultVatRate ?? 15;

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
    setExpandedResultLineIds(new Set());
    clearDraft();
  }, [clearDraft, setLines]);

  const isDirty =
    lines.some((l) => l.itemId) || !!invoiceNumber.trim() || !!invoiceDate || !!supplierId;

  const handleEntityChange = useCallback(
    (newEntityId: string) => {
      const isDirtyLines = lines.some((l) => l.itemId);
      if (isDirtyLines) {
        if (!window.confirm('Changing entity will clear your current lines. Continue?')) return;
        setLines([createEmptyLine()]);
      }
      setEntityId(newEntityId);
      localStorage.setItem('last-invoice-entity', newEntityId);
    },
    [lines, setLines],
  );

  const handleSave = useCallback(async () => {
    if (!canSave) {
      setSaveError('Complete all rows before saving — each row needs an item and quantity.');
      return;
    }
    setSaveError(null);
    setIsSaving(true);
    try {
      await invoiceService.saveAndPostInvoice({
        id: window.crypto.randomUUID(),
        entityId,
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
      toast.success('Invoice posted');
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to save invoice');
    } finally {
      setIsSaving(false);
    }
  }, [
    canSave,
    validLines,
    entityId,
    invoiceNumber,
    invoiceDate,
    supplierId,
    vatMode,
    vatRate,
    itemMetaMap,
    clearForm,
  ]);

  const handleSaveDraft = useCallback(async () => {
    if (!canSave) {
      setSaveError('Complete all rows before saving — each row needs an item and quantity.');
      return;
    }
    setSaveError(null);
    setIsSavingDraft(true);
    try {
      await invoiceService.saveInvoice({
        id: window.crypto.randomUUID(),
        entityId,
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
      toast.success('Draft saved');
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to save draft');
    } finally {
      setIsSavingDraft(false);
    }
  }, [
    canSave,
    validLines,
    entityId,
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
    entityId,
    handleEntityChange,
    expandedResultLineIds,
    isReused,
    reuseNoticeDismissed,
    setReuseNoticeDismissed,
    isSaving,
    isSavingDraft,
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
    handleSaveDraft,
  };
}
