import { Link } from 'react-router-dom';
import { Button } from '@reyogo/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@reyogo/ui';
import { InvoiceRoutes } from '@/components/AppRoutes/routePaths';
import type {
  ICapturedInvoice,
  ICapturedInvoiceWithLines,
  ISaveCreditNotePayload,
  Supplier,
} from '@reyogo/types';
import type { SortDir } from '@/hooks/useTableSort';
import type { RowMode } from '../../types';
import { InvoiceRow } from '../InvoiceRow';
import { SortableHead } from '../SortableHead';
import type { ProcessReceiptLine } from '../../../types';

const COLUMN_COUNT = 10;

type Props = {
  loading: boolean;
  invoices: ICapturedInvoice[];
  drafts: ICapturedInvoice[];
  sortedPosted: ICapturedInvoice[];
  hasFilters: boolean;
  sortKey: string | null;
  sortDir: SortDir;
  toggleSort: (key: string) => void;
  rowMode: Record<string, RowMode>;
  detailCache: Record<string, ICapturedInvoiceWithLines>;
  postingId: string | null;
  suppliers: Supplier[];
  onExpand: (id: string) => void;
  onEditClick: (id: string) => void;
  onAuditClick: (id: string) => void;
  onPost: (id: string) => void;
  onReuse: (id: string) => void;
  onRaiseCreditNoteClick: (id: string) => void;
  onSaveEdit: (inv: ICapturedInvoice, lines: ProcessReceiptLine[], note: string) => Promise<void>;
  onMetadataSave: (
    id: string,
    fields: {
      supplierId: string | null;
      invoiceNumber: string;
      invoiceDate: Date | null;
      note: string;
    },
  ) => Promise<void>;
  onSaveCreditNote: (payload: ISaveCreditNotePayload) => void;
  onSetMode: (id: string, mode: RowMode) => void;
};

export function InvoiceHistoryTable({
  loading,
  invoices,
  drafts,
  sortedPosted,
  hasFilters,
  sortKey,
  sortDir,
  toggleSort,
  rowMode,
  detailCache,
  postingId,
  suppliers,
  onExpand,
  onEditClick,
  onAuditClick,
  onPost,
  onReuse,
  onRaiseCreditNoteClick,
  onSaveEdit,
  onMetadataSave,
  onSaveCreditNote,
  onSetMode,
}: Props) {
  const posted = sortedPosted;

  const rowProps = {
    detailCache,
    postingId,
    suppliers,
    onExpand,
    onEditClick,
    onAuditClick,
    onPost,
    onReuse,
    onRaiseCreditNoteClick,
    onSaveEdit,
    onMetadataSave,
    onSaveCreditNote,
    onSetMode,
  };

  return (
    <div className="min-h-0 flex-1 overflow-auto p-4">
      {loading ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : invoices.length === 0 ? (
        <div className="rounded-lg border border-[var(--nav-border)] bg-muted/10 p-10 text-center text-sm text-muted-foreground/60">
          {hasFilters ? (
            <p>No invoices match the current filters.</p>
          ) : (
            <>
              <p>No captured invoices yet.</p>
              <Button asChild variant="link" className="mt-2">
                <Link to={InvoiceRoutes.Base}>Capture your first invoice</Link>
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--nav-border)] overflow-hidden">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-8 p-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70" />
                <SortableHead
                  sortKey="invoiceNumber"
                  label="Invoice #"
                  activeKey={sortKey}
                  activeDir={sortDir}
                  onToggle={toggleSort}
                />
                <SortableHead
                  sortKey="date"
                  label="Date"
                  activeKey={sortKey}
                  activeDir={sortDir}
                  onToggle={toggleSort}
                />
                <SortableHead
                  sortKey="lines"
                  label="Lines"
                  activeKey={sortKey}
                  activeDir={sortDir}
                  onToggle={toggleSort}
                  className="w-14"
                />
                <SortableHead
                  sortKey="excl"
                  label="Excl."
                  activeKey={sortKey}
                  activeDir={sortDir}
                  onToggle={toggleSort}
                  className="w-28"
                />
                <TableHead className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 w-24 text-right">
                  VAT
                </TableHead>
                <TableHead className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 w-28 text-right">
                  Total
                </TableHead>
                <SortableHead
                  sortKey="status"
                  label="Status"
                  activeKey={sortKey}
                  activeDir={sortDir}
                  onToggle={toggleSort}
                  className="w-24"
                />
                <SortableHead
                  sortKey="lastEdited"
                  label="Last edited"
                  activeKey={sortKey}
                  activeDir={sortDir}
                  onToggle={toggleSort}
                  className="w-36"
                />
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {drafts.length > 0 && (
                <TableRow className="hover:bg-transparent border-none h-7">
                  <TableCell
                    colSpan={COLUMN_COUNT}
                    className="py-1.5 px-3 border-l-[2.5px] border-l-amber-500 bg-amber-100 dark:bg-amber-900/40"
                  >
                    <div className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-amber-600 inline-block animate-pulse" />
                      <span className="text-[10px] uppercase tracking-[0.14em] text-amber-900 dark:text-amber-200 font-semibold">
                        {drafts.length} draft{drafts.length !== 1 ? 's' : ''} pending review
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {drafts.map((inv, i) => (
                <InvoiceRow
                  key={inv.id}
                  inv={inv}
                  rowIndex={i}
                  mode={rowMode[inv.id]}
                  detail={detailCache[inv.id]}
                  {...rowProps}
                />
              ))}

              {drafts.length > 0 && posted.length > 0 && (
                <TableRow className="hover:bg-transparent h-px">
                  <TableCell colSpan={COLUMN_COUNT} className="p-0 bg-border/40" />
                </TableRow>
              )}

              {sortedPosted.map((inv, i) => (
                <InvoiceRow
                  key={inv.id}
                  inv={inv}
                  rowIndex={i}
                  mode={rowMode[inv.id]}
                  detail={detailCache[inv.id]}
                  {...rowProps}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
