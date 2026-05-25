import { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { InvoiceStatus } from '@reyogo/types';
import { useInventory } from '@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext';
import { invoiceService } from '@/services/invoice';
import type { ProcessReceiptLine } from '../../types';
import { getProcessLineComputed } from '../../types';
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
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [expandedResultLineIds, setExpandedResultLineIds] = useState<Set<string>>(new Set());
  const [reuseNoticeDismissed, setReuseNoticeDismissed] = useState(false);

  const { lines, setLines, addLine, removeLine, updateLine, setAllVatMode } =
    useLineManager(initialLines);

  const { clearDraft } = useDraftPersistence(lines, invoiceNumber, invoiceDate, isReused);

  const { invoiceSummary, validLines, itemsWithCategory, itemMetaMap } = useInvoiceSummary(
    lines,
    items,
    categories,
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
    if (validLines.length === 0) {
      setSaveError('Add at least one line with an item, quantity, and total.');
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
        status: InvoiceStatus.Draft,
        totalExclTax: invoiceSummary.subtotal,
        taxAmount: invoiceSummary.totalVat,
        totalInclTax: invoiceSummary.grandTotal,
        lines: validLines.map((line) => {
          const computed = getProcessLineComputed(line);
          const qty = Number(line.quantity) || 1;
          const totalCost = computed.netTotal;
          return {
            id: line.id,
            inventoryItemId: line.itemId,
            qty,
            unitCost: qty > 0 ? totalCost / qty : 0,
            totalCost,
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
  }, [validLines, invoiceNumber, invoiceDate, supplierId, invoiceSummary, clearForm]);

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
    itemsWithCategory,
    itemMetaMap,
    invoiceSummary,
    validLines,
    handleSave,
  };
}
