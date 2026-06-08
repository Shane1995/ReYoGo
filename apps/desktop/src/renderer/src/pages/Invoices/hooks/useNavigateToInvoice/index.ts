import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createElement } from 'react';
import { VatMode } from '@reyogo/types';
import { InvoiceRoutes } from '@/components/AppRoutes/routePaths';
import { loadDraft, saveDraft } from '../useDraftPersistence';
import { DraftConflictModal } from '../../components/DraftConflictModal';
import type { ProcessReceiptLine } from '../../types';

type NavigateOptions = { reuse?: boolean };
type Draft = ReturnType<typeof loadDraft>;
type Pending = { lines: ProcessReceiptLine[]; reuse: boolean };

function loadPendingDraft(pending: Pending | null): Draft | null {
  if (pending === null) return null;
  return loadDraft();
}

function draftItemsOf(draft: Draft | null): ProcessReceiptLine[] {
  if (!draft) return [];
  return draft.lines.filter((l) => !!l.itemId);
}

function shouldShowConflictModal(pending: Pending | null, draftItemCount: number): boolean {
  if (pending === null) return false;
  if (draftItemCount === 0) return false;
  return !pending.reuse;
}

function reuseOption(options: NavigateOptions): boolean {
  if (options.reuse) return true;
  return false;
}

function hasExistingItems(draft: Draft | null): boolean {
  if (!draft) return false;
  return draft.lines.some((l) => !!l.itemId);
}

function shouldPromptConflict(draft: Draft | null, reuse: boolean): boolean {
  if (reuse) return false;
  return hasExistingItems(draft);
}

function existingLinesOf(draft: Draft | null): ProcessReceiptLine[] {
  if (!draft) return [];
  return draft.lines;
}

function mergeLines(
  existingLines: ProcessReceiptLine[],
  pendingLines: ProcessReceiptLine[],
): ProcessReceiptLine[] {
  const existingIds = new Set(existingLines.map((l) => l.itemId).filter(Boolean));
  const newLines = pendingLines.filter((l) => !existingIds.has(l.itemId));
  return [...existingLines, ...newLines];
}

function draftFieldsFrom(draft: Draft | null): {
  invoiceNumber: string;
  invoiceDate: string;
  vatMode: VatMode;
} {
  if (!draft) return { invoiceNumber: '', invoiceDate: '', vatMode: VatMode.Exclusive };
  return {
    invoiceNumber: draft.invoiceNumber,
    invoiceDate: draft.invoiceDate,
    vatMode: draft.vatMode,
  };
}

export function useNavigateToInvoice() {
  const navigate = useNavigate();
  const [pending, setPending] = useState<Pending | null>(null);

  const draft = loadPendingDraft(pending);
  const draftItems = draftItemsOf(draft);

  const navigateToInvoice = useCallback(
    (templateLines: ProcessReceiptLine[], options: NavigateOptions = {}) => {
      const reuse = reuseOption(options);
      const existing = loadDraft();
      if (shouldPromptConflict(existing, reuse)) {
        setPending({ lines: templateLines, reuse });
        return;
      }
      navigate(InvoiceRoutes.Base, { state: { templateLines, isReuse: reuse } });
    },
    [navigate],
  );

  const handleAppend = useCallback(() => {
    if (!pending) return;
    const existing = loadDraft();
    const merged = mergeLines(existingLinesOf(existing), pending.lines);
    saveDraft({ lines: merged, ...draftFieldsFrom(existing) });
    navigate(InvoiceRoutes.Base, { state: { templateLines: merged, isReuse: false } });
    setPending(null);
  }, [pending, navigate]);

  const handleFresh = useCallback(() => {
    if (!pending) return;
    navigate(InvoiceRoutes.Base, { state: { templateLines: pending.lines, isReuse: false } });
    setPending(null);
  }, [pending, navigate]);

  const handleCancel = useCallback(() => {
    setPending(null);
  }, []);

  const conflictModal = createElement(DraftConflictModal, {
    open: shouldShowConflictModal(pending, draftItems.length),
    draftItemCount: draftItems.length,
    onAppend: handleAppend,
    onFresh: handleFresh,
    onCancel: handleCancel,
  });

  return { navigateToInvoice, conflictModal };
}
