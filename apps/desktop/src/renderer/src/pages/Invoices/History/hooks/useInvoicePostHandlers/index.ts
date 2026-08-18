import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { ICapturedInvoiceWithLines, ISaveCreditNotePayload } from '@reyogo/types';
import { invoiceService } from '@/services/invoice';
import { ipcErrorMessage } from '@/utils/ipcErrorMessage';
import { RowModeKind, type RowMode } from '../../types';

type PostHandlerDeps = {
  detailCache: Record<string, ICapturedInvoiceWithLines>;
  setDetailCache: React.Dispatch<React.SetStateAction<Record<string, ICapturedInvoiceWithLines>>>;
  loadInvoices: () => Promise<void>;
  setMode: (id: string, mode: RowMode) => void;
};

export function useInvoicePostHandlers({ setDetailCache, loadInvoices, setMode }: PostHandlerDeps) {
  const [postingId, setPostingId] = useState<string | null>(null);
  const [creditNoteSubmitting, setCreditNoteSubmitting] = useState(false);

  const handlePost = useCallback(
    async (id: string) => {
      setPostingId(id);
      try {
        await invoiceService.postInvoice(id);
        setDetailCache((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        await loadInvoices();
        toast.success('Invoice posted');
      } catch (err) {
        toast.error(ipcErrorMessage(err, 'Failed to post the invoice'));
      } finally {
        setPostingId(null);
      }
    },
    [loadInvoices, setDetailCache],
  );

  const handleSaveCreditNote = useCallback(
    async (payload: ISaveCreditNotePayload) => {
      setCreditNoteSubmitting(true);
      try {
        await invoiceService.saveCreditNote(payload);
        await loadInvoices();
        setMode(payload.sourceInvoiceId, { kind: RowModeKind.View });
        toast.success('Damage / return recorded');
      } catch (err) {
        toast.error(ipcErrorMessage(err, 'Failed to record the damage / return'));
      } finally {
        setCreditNoteSubmitting(false);
      }
    },
    [loadInvoices, setMode],
  );

  return {
    postingId,
    creditNoteSubmitting,
    handlePost,
    handleSaveCreditNote,
  };
}
