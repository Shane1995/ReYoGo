import { useState, useCallback, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useInventory } from '@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext';
import type { InventoryItem } from '@/pages/Inventory/Capture/CapturedInventory/types';
import { useEntities } from '@/Context/EntityContext';
import { invoiceService } from '@/services/invoice';
import { VatMode } from '@reyogo/types';
import type { ProcessReceiptLine } from '../../types';
import { getProcessLineComputed } from '../../types';
import { createEmptyLine } from '../../utils/createEmptyLine';
import { loadDraft, useDraftPersistence } from '../useDraftPersistence';
import { useLineManager } from '../useLineManager';
import { useInvoiceSummary } from '../useInvoiceSummary';

function buildSaveLines(
  validLines: ProcessReceiptLine[],
  itemMetaMap: Map<string, { name: string }>,
  vatMode: VatMode,
  vatRate: number,
) {
  return validLines.map((line) => {
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
  });
}

export function useInvoiceForm() {
  const { items, categories, unitOptions, addCategory, addItem } = useInventory();
  const { entities, selectedEntityId: entityId } = useEntities();
  const location = useLocation();
  const navigate = useNavigate();

  const locationState =
    (location.state as { templateLines?: ProcessReceiptLine[]; isReuse?: boolean } | null) ?? null;
  const templateLines = locationState?.templateLines;
  const isReused = locationState?.isReuse === true;

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
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [expandedResultLineIds, setExpandedResultLineIds] = useState<Set<string>>(new Set());
  const [reuseNoticeDismissed, setReuseNoticeDismissed] = useState(false);
  const [lastUnitCosts, setLastUnitCosts] = useState<Record<string, number>>({});

  const { lines, setLines, addLine, removeLine, updateLine } = useLineManager(
    initialLines,
    vatMode,
  );

  // When navigating here from inventory the component stays mounted (same route), so useState
  // initialisers don't re-run. Re-sync on location.key — a stable string that only changes on
  // actual navigation, never on local state updates — so clearForm can't accidentally retrigger it.
  useEffect(() => {
    if (!templateLines || templateLines.length === 0) return;
    setLines(templateLines);
    setInvoiceNumber('');
    setInvoiceDate('');
    setSupplierId('');
    setVatModeState(VatMode.Exclusive);
    setReuseNoticeDismissed(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

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

  const addItemForEntity = useCallback(
    (item: Omit<InventoryItem, 'id'>) => addItem({ ...item, entityId }),
    [addItem, entityId],
  );

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
    setVatModeState(VatMode.Exclusive);
    setExpandedResultLineIds(new Set());
    clearDraft();
    // Replace the current history entry with no state so that location.state.templateLines
    // doesn't survive a page reload (createHashRouter persists history state across Cmd+R).
    navigate(location.pathname, { replace: true, state: null });
  }, [clearDraft, setLines, navigate, location.pathname]);

  const isDirty =
    lines.some((l) => l.itemId) || !!invoiceNumber.trim() || !!invoiceDate || !!supplierId;

  const handleSave = useCallback(async () => {
    if (!selectedEntity) {
      setSaveError('No entity selected. Please select a business in the top bar.');
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
        lines: buildSaveLines(validLines, itemMetaMap, vatMode, vatRate),
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
      setSaveError('No entity selected. Please select a business in the top bar.');
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
        lines: buildSaveLines(validLines, itemMetaMap, vatMode, vatRate),
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
    unitOptions,
    categories,
    addCategory,
    addItem: addItemForEntity,
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
