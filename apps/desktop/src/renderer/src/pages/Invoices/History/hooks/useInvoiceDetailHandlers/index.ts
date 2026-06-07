import { useCallback } from 'react';
import type { ICapturedInvoiceWithLines } from '@reyogo/types';
import { InvoiceStatus } from '@reyogo/types';
import { invoiceService } from '@/services/invoice';
import { useNavigateToInvoice } from '../../../hooks/useNavigateToInvoice';
import { RowModeKind, type RowMode } from '../../types';

type DetailHandlerDeps = {
  detailCache: Record<string, ICapturedInvoiceWithLines>;
  setDetailCache: React.Dispatch<React.SetStateAction<Record<string, ICapturedInvoiceWithLines>>>;
  rowMode: Record<string, RowMode>;
  setMode: (id: string, mode: RowMode) => void;
};

export function useInvoiceDetailHandlers({
  detailCache,
  setDetailCache,
  rowMode,
  setMode,
}: DetailHandlerDeps) {
  const { navigateToInvoice, conflictModal } = useNavigateToInvoice();

  const getDetail = useCallback(
    async (id: string): Promise<ICapturedInvoiceWithLines | null> => {
      if (detailCache[id]) return detailCache[id];
      const inv = await invoiceService.getInvoice(id);
      if (inv) setDetailCache((prev) => ({ ...prev, [id]: inv }));
      return inv ?? null;
    },
    [detailCache, setDetailCache],
  );

  const handleExpandDetail = useCallback(
    async (id: string) => {
      const current = rowMode[id];
      if (current?.kind === RowModeKind.Detail) {
        setMode(id, { kind: RowModeKind.View });
        return;
      }
      await getDetail(id);
      setMode(id, { kind: RowModeKind.Detail });
    },
    [rowMode, getDetail, setMode],
  );

  const handleEditClick = useCallback(
    async (id: string) => {
      const detail = await getDetail(id);
      const isPosted = detail?.status === InvoiceStatus.Posted;
      setMode(id, { kind: isPosted ? RowModeKind.MetadataEdit : RowModeKind.Edit });
    },
    [getDetail, setMode],
  );

  const handleAuditClick = useCallback(
    (id: string) => {
      setMode(id, { kind: RowModeKind.Audit });
    },
    [setMode],
  );

  const handleReuse = useCallback(
    async (id: string) => {
      let detail = detailCache[id];
      if (!detail) {
        const inv = await invoiceService.getInvoice(id);
        if (inv) {
          setDetailCache((prev) => ({ ...prev, [id]: inv }));
          detail = inv;
        }
      }
      if (!detail) return;
      const templateLines = detail.lines.map((l) => ({
        id: window.crypto.randomUUID(),
        itemId: l.itemId,
        quantity: 0,
        isVatable: l.isVatable,
        totalVatExclude: 0,
      }));
      navigateToInvoice(templateLines, { reuse: true });
    },
    [detailCache, setDetailCache, navigateToInvoice],
  );

  const handleRaiseCreditNoteClick = useCallback(
    (id: string) => {
      setMode(id, { kind: RowModeKind.CreditNote });
    },
    [setMode],
  );

  return {
    conflictModal,
    getDetail,
    handleExpandDetail,
    handleEditClick,
    handleAuditClick,
    handleReuse,
    handleRaiseCreditNoteClick,
  };
}
