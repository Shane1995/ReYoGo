import { useState, useCallback, useEffect } from 'react';
import { VatMode } from '@reyogo/types';
import type { ProcessReceiptLine } from '../../types';
import { createEmptyLine } from '../../utils/createEmptyLine';
import { loadDraft } from '../useDraftPersistence';
import { useLineManager } from '../useLineManager';

function getInitialInvoiceNumber(isReused: boolean): string {
  if (isReused) return '';
  return loadDraft()?.invoiceNumber ?? '';
}

function getInitialInvoiceDate(isReused: boolean): string {
  if (isReused) return '';
  return loadDraft()?.invoiceDate ?? '';
}

function getInitialVatMode(isReused: boolean): VatMode {
  if (isReused) return VatMode.Exclusive;
  return loadDraft()?.vatMode ?? VatMode.Exclusive;
}

export function useInvoiceFormFields(
  initialLines: ProcessReceiptLine[],
  isReused: boolean,
  templateLines: ProcessReceiptLine[] | undefined,
  locationKey: string,
) {
  const [invoiceNumber, setInvoiceNumber] = useState<string>(() =>
    getInitialInvoiceNumber(isReused),
  );
  const [invoiceDate, setInvoiceDate] = useState<string>(() => getInitialInvoiceDate(isReused));
  const [supplierId, setSupplierId] = useState<string>('');
  const [vatMode, setVatModeState] = useState<VatMode>(() => getInitialVatMode(isReused));
  const [expandedResultLineIds, setExpandedResultLineIds] = useState<Set<string>>(new Set());
  const [reuseNoticeDismissed, setReuseNoticeDismissed] = useState(false);

  const { lines, setLines, addLine, removeLine, updateLine } = useLineManager(
    initialLines,
    vatMode,
  );

  const setVatMode = useCallback((mode: VatMode) => setVatModeState(mode), []);

  const toggleResultRow = useCallback((lineId: string) => {
    setExpandedResultLineIds((prev) => {
      const next = new Set(prev);
      if (next.has(lineId)) next.delete(lineId);
      else next.add(lineId);
      return next;
    });
  }, []);

  const resetFields = useCallback(() => {
    setLines([createEmptyLine()]);
    setInvoiceNumber('');
    setInvoiceDate('');
    setSupplierId('');
    setVatModeState(VatMode.Exclusive);
    setExpandedResultLineIds(new Set());
  }, [setLines]);

  const applyTemplateLines = useCallback(
    (nextLines: ProcessReceiptLine[]) => {
      setLines(nextLines);
      setInvoiceNumber('');
      setInvoiceDate('');
      setSupplierId('');
      setVatModeState(VatMode.Exclusive);
      setReuseNoticeDismissed(false);
    },
    [setLines],
  );

  // When navigating here from inventory the component stays mounted (same route), so useState
  // initialisers don't re-run. Re-sync on locationKey — a stable string that only changes on
  // actual navigation, never on local state updates — so resetFields can't accidentally retrigger it.
  useEffect(() => {
    if (!templateLines || templateLines.length === 0) return;
    applyTemplateLines(templateLines);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationKey]);

  return {
    invoiceNumber,
    setInvoiceNumber,
    invoiceDate,
    setInvoiceDate,
    supplierId,
    setSupplierId,
    vatMode,
    setVatMode,
    expandedResultLineIds,
    toggleResultRow,
    reuseNoticeDismissed,
    setReuseNoticeDismissed,
    lines,
    addLine,
    removeLine,
    updateLine,
    resetFields,
    applyTemplateLines,
  };
}
