import { useState, useCallback, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useInventory } from '@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext';
import { useEntities } from '@/Context/EntityContext';
import { invoiceService } from '@/services/invoice';
import { VatMode } from '@reyogo/types';
import type { ProcessReceiptLine } from '../../types';
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
    isReused ? VatMode.Exclusive : (loadDraft()?.vatMode ?? VatMode.Exclusive),
  );
  const [entityId, setEntityId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [expandedResultLineIds, setExpandedResultLineIds] = useState<Set<string>>(new Set());
  const [reuseNoticeDismissed, setReuseNoticeDismissed] = useState(false);
  const [lastUnitCosts, setLastUnitCosts] = useState<Record<string, number>>({});

  const { lines, setLines, addLine, removeLine, updateLine } = useLineManager(initialLines);

  useEffect(() => {
    invoiceService
      .getLastUnitPrices()
      .then((prices) => {
        setLastUnitCosts(
          Object.fromEntries(Object.entries(prices).map(([id, p]) => [id, p.inclVat])),
        );
      })
      .catch((err: unknown) => {
        console.error('Failed to load last unit prices', err);
      });
  }, []);

  const setVatMode = useCallback((mode: VatMode) => {
    setVatModeState(mode);
  }, []);

  const selectedEntity = entities.find((e) => e.id === entityId) ?? null;

  const { clearDraft } = useDraftPersistence(lines, invoiceNumber, invoiceDate, vatMode, isReused);

  const entityItems = useMemo(
    () => (entityId ? items.filter((item) => item.entityId === entityId) : []),
    [items, entityId],
  );

  const { invoiceSummary, validLines, itemsWithCategory, itemMetaMap } = useInvoiceSummary(
    lines,
    entityItems,
    categories,
    vatMode,
    selectedEntity?.defaultVatRate ?? 0,
    lastUnitCosts,
  );

  const canSave =
    !!invoiceNumber.trim() &&
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
    setEntityId('');
    setVatModeState(VatMode.Exclusive);
    setExpandedResultLineIds(new Set());
    clearDraft();
  }, [clearDraft, setLines]);

  const isDirty =
    !!entityId ||
    lines.some((l) => l.itemId) ||
    !!invoiceNumber.trim() ||
    !!invoiceDate ||
    !!supplierId;

  const handleEntityChange = useCallback(
    (newEntityId: string) => {
      const isDirtyLines = lines.some((l) => l.itemId);
      if (isDirtyLines) {
        if (!window.confirm('Changing entity will clear your current lines. Continue?')) return;
        setLines([createEmptyLine()]);
      }
      setEntityId(newEntityId);
    },
    [lines, setLines],
  );

  const handleSave = useCallback(async () => {
    if (!selectedEntity) {
      setSaveError('Select an entity before saving.');
      return;
    }
    if (!canSave) {
      setSaveError(
        !invoiceNumber.trim()
          ? 'Invoice number is required.'
          : 'Complete all rows before saving — each row needs an item and quantity.',
      );
      return;
    }
    setSaveError(null);
    setIsSaving(true);
    const vatRate = selectedEntity.defaultVatRate;
    try {
      await invoiceService.saveAndPostInvoice({
        id: window.crypto.randomUUID(),
        entityId,
        supplierId: supplierId || null,
        invoiceNumber: invoiceNumber.trim(),
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
            unitPrice: computed.netUnitPrice,
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
    selectedEntity,
    canSave,
    validLines,
    entityId,
    invoiceNumber,
    invoiceDate,
    supplierId,
    vatMode,
    itemMetaMap,
    clearForm,
  ]);

  const handleSaveDraft = useCallback(async () => {
    if (!selectedEntity) {
      setSaveError('Select an entity before saving.');
      return;
    }
    if (!canSave) {
      setSaveError(
        !invoiceNumber.trim()
          ? 'Invoice number is required.'
          : 'Complete all rows before saving — each row needs an item and quantity.',
      );
      return;
    }
    setSaveError(null);
    setIsSavingDraft(true);
    const vatRate = selectedEntity.defaultVatRate;
    try {
      await invoiceService.saveInvoice({
        id: window.crypto.randomUUID(),
        entityId,
        supplierId: supplierId || null,
        invoiceNumber: invoiceNumber.trim(),
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
            unitPrice: computed.netUnitPrice,
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
    selectedEntity,
    canSave,
    validLines,
    entityId,
    invoiceNumber,
    invoiceDate,
    supplierId,
    vatMode,
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
    selectedEntity,
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
