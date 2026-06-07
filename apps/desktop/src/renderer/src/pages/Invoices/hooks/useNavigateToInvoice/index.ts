import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createElement } from 'react';
import { VatMode } from '@reyogo/types';
import { InvoiceRoutes } from '@/components/AppRoutes/routePaths';
import { loadDraft, saveDraft } from '../useDraftPersistence';
import { DraftConflictModal } from '../../components/DraftConflictModal';
import type { ProcessReceiptLine } from '../../types';

type NavigateOptions = { reuse?: boolean };

export function useNavigateToInvoice() {
  const navigate = useNavigate();
  const [pending, setPending] = useState<{ lines: ProcessReceiptLine[]; reuse: boolean } | null>(
    null,
  );

  const draft = pending !== null ? loadDraft() : null;
  const draftItems = draft?.lines.filter((l) => !!l.itemId) ?? [];

  const navigateToInvoice = useCallback(
    (templateLines: ProcessReceiptLine[], options: NavigateOptions = {}) => {
      const reuse = options.reuse ?? false;
      const existing = loadDraft();
      const hasItems = existing?.lines.some((l) => !!l.itemId) ?? false;
      if (hasItems && !reuse) {
        setPending({ lines: templateLines, reuse });
      } else {
        navigate(InvoiceRoutes.Base, { state: { templateLines, isReuse: reuse } });
      }
    },
    [navigate],
  );

  const handleAppend = useCallback(() => {
    if (!pending) return;
    const existing = loadDraft();
    const existingIds = new Set((existing?.lines ?? []).map((l) => l.itemId).filter(Boolean));
    const newLines = pending.lines.filter((l) => !existingIds.has(l.itemId));
    const merged = [...(existing?.lines ?? []), ...newLines];
    saveDraft({
      lines: merged,
      invoiceNumber: existing?.invoiceNumber ?? '',
      invoiceDate: existing?.invoiceDate ?? '',
      vatMode: existing?.vatMode ?? VatMode.Exclusive,
    });
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
    open: pending !== null && draftItems.length > 0 && !pending.reuse,
    draftItemCount: draftItems.length,
    onAppend: handleAppend,
    onFresh: handleFresh,
    onCancel: handleCancel,
  });

  return { navigateToInvoice, conflictModal };
}
