import type { useInvoiceHistory } from '../hooks/useInvoiceHistory';
import type { RowProps } from '../components/InvoiceHistoryTable';

export function buildRowProps(history: ReturnType<typeof useInvoiceHistory>): RowProps {
  return {
    detailCache: history.detailCache,
    postingId: history.postingId,
    suppliers: history.suppliers,
    onExpand: history.handleExpandDetail,
    onEditClick: history.handleEditClick,
    onEditDetailsClick: history.handleEditDetailsClick,
    onAuditClick: history.handleAuditClick,
    onPost: history.handlePost,
    onReuse: history.handleReuse,
    onRaiseCreditNoteClick: history.handleRaiseCreditNoteClick,
    onSaveEdit: history.handleSaveEdit,
    onMetadataSave: history.handleMetadataSave,
    onSaveCreditNote: history.handleSaveCreditNote,
    onSetMode: history.setMode,
  };
}
