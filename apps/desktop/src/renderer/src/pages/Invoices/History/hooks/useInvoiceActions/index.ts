import type { ICapturedInvoiceWithLines } from '@reyogo/types';
import { useInventory } from '@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext';
import { type RowMode } from '../../types';
import { useInvoiceDetailHandlers } from '../useInvoiceDetailHandlers';
import { useInvoicePostHandlers } from '../useInvoicePostHandlers';
import { useInvoiceSaveHandlers } from '../useInvoiceSaveHandlers';

type Deps = {
  detailCache: Record<string, ICapturedInvoiceWithLines>;
  setDetailCache: React.Dispatch<React.SetStateAction<Record<string, ICapturedInvoiceWithLines>>>;
  rowMode: Record<string, RowMode>;
  loadInvoices: () => Promise<void>;
  setMode: (id: string, mode: RowMode) => void;
};

export function useInvoiceActions({
  detailCache,
  setDetailCache,
  rowMode,
  loadInvoices,
  setMode,
}: Deps) {
  const { items } = useInventory();

  const detail = useInvoiceDetailHandlers({ detailCache, setDetailCache, rowMode, setMode });
  const post = useInvoicePostHandlers({ detailCache, setDetailCache, loadInvoices, setMode });
  const save = useInvoiceSaveHandlers({
    items,
    detailCache,
    setDetailCache,
    loadInvoices,
    setMode,
  });

  return {
    postingId: post.postingId,
    creditNoteSubmitting: post.creditNoteSubmitting,
    conflictModal: detail.conflictModal,
    handleReuse: detail.handleReuse,
    handleExpandDetail: detail.handleExpandDetail,
    handleEditClick: detail.handleEditClick,
    handleEditDetailsClick: detail.handleEditDetailsClick,
    handleAuditClick: detail.handleAuditClick,
    handlePost: post.handlePost,
    handleRaiseCreditNoteClick: detail.handleRaiseCreditNoteClick,
    handleSaveCreditNote: post.handleSaveCreditNote,
    handleSaveEdit: save.handleSaveEdit,
    handleMetadataSave: save.handleMetadataSave,
  };
}
