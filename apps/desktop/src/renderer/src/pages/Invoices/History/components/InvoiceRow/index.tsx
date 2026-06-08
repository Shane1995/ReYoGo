import { Fragment } from 'react';
import { cn } from '@reyogo/ui';
import { InvoiceStatus } from '@reyogo/types';
import { TableCell, TableRow } from '@reyogo/ui';
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import type {
  ICapturedInvoice,
  ICapturedInvoiceWithLines,
  ISaveCreditNotePayload,
  Supplier,
} from '@reyogo/types';
import { RowModeKind, type RowMode } from '../../types';
import { StatusBadge } from '../StatusBadge';
import { RowActions } from '../RowActions';
import { EditPanel } from '../EditPanel';
import { MetadataEditPanel } from '../MetadataEditPanel';
import { AuditPanel } from '../AuditPanel';
import { RaiseCreditNotePanel } from '../RaiseCreditNotePanel';
import { InvoiceDetailLines } from '../InvoiceDetailLines';
import { formatDate } from '../../../utils/formatDate';
import { formatMoney } from '../../../utils/formatMoney';
import { invoiceTotals } from '../../../utils/invoiceTotals';
import type { ProcessReceiptLine } from '../../../types';

const COLUMN_COUNT = 10;

type DateCellProps = {
  inv: ICapturedInvoice;
  isCreditNote: boolean;
  suppliers: Supplier[];
  detailCache: Record<string, ICapturedInvoiceWithLines>;
};

function InvoiceDateCell({ inv, isCreditNote, suppliers, detailCache }: DateCellProps) {
  return (
    <TableCell className="text-sm text-muted-foreground">
      {inv.invoiceDate ? formatDate(inv.invoiceDate) : formatDate(inv.createdAt)}
      {inv.supplierId && suppliers.length > 0 && (
        <p className="text-[11px] text-muted-foreground/50 mt-0.5">
          {suppliers.find((s) => s.id === inv.supplierId)?.name}
        </p>
      )}
      {isCreditNote && inv.sourceInvoiceId && (
        <p className="text-[11px] text-rose-500/70 mt-0.5">
          CN of {detailCache[inv.sourceInvoiceId]?.invoiceNumber ?? inv.sourceInvoiceId}
        </p>
      )}
    </TableCell>
  );
}

type AmountCellsProps = {
  detail: ICapturedInvoiceWithLines | undefined;
};

function InvoiceAmountCells({ detail }: AmountCellsProps) {
  const totals = detail ? invoiceTotals(detail) : null;
  return (
    <>
      <TableCell className="text-right text-sm text-muted-foreground tabular-nums">
        {detail ? detail.lines.length : '—'}
      </TableCell>
      <TableCell className="text-right font-mono text-sm tabular-nums">
        {totals ? formatMoney(totals.excl) : '—'}
      </TableCell>
      <TableCell className="text-right font-mono text-sm tabular-nums text-muted-foreground">
        {totals ? formatMoney(totals.vat) : '—'}
      </TableCell>
      <TableCell className="text-right font-mono text-sm tabular-nums font-semibold">
        {totals ? formatMoney(totals.total) : '—'}
      </TableCell>
    </>
  );
}

type ExpansionPanelProps = {
  modeKind: RowModeKind;
  inv: ICapturedInvoice;
  detail: ICapturedInvoiceWithLines | undefined;
  suppliers: Supplier[];
  onSaveEdit: Props['onSaveEdit'];
  onMetadataSave: Props['onMetadataSave'];
  onSaveCreditNote: Props['onSaveCreditNote'];
  cancelView: () => void;
};

function ExpansionPanels({
  modeKind,
  inv,
  detail,
  suppliers,
  onSaveEdit,
  onMetadataSave,
  onSaveCreditNote,
  cancelView,
}: ExpansionPanelProps) {
  return (
    <>
      {modeKind === RowModeKind.Detail && detail && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={COLUMN_COUNT} className="p-0">
            <div className="border-t border-[var(--nav-border)] bg-[var(--nav-accent)]/30 px-6 py-4">
              <InvoiceDetailLines invoice={detail} />
            </div>
          </TableCell>
        </TableRow>
      )}
      {modeKind === RowModeKind.Edit && detail && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={COLUMN_COUNT} className="p-0">
            <EditPanel
              invoice={detail}
              onSave={(lines, note) => onSaveEdit(inv, lines, note)}
              onCancel={cancelView}
            />
          </TableCell>
        </TableRow>
      )}
      {modeKind === RowModeKind.MetadataEdit && detail && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={COLUMN_COUNT} className="p-0">
            <MetadataEditPanel
              invoice={detail}
              suppliers={suppliers}
              onSave={(fields) => onMetadataSave(inv.id, fields)}
              onCancel={cancelView}
            />
          </TableCell>
        </TableRow>
      )}
      {modeKind === RowModeKind.Audit && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={COLUMN_COUNT} className="p-0">
            <AuditPanel invoiceId={inv.id} suppliers={suppliers} onClose={cancelView} />
          </TableCell>
        </TableRow>
      )}
      {modeKind === RowModeKind.CreditNote && detail && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={COLUMN_COUNT} className="p-0">
            <RaiseCreditNotePanel
              invoice={detail}
              onConfirm={onSaveCreditNote}
              onCancel={cancelView}
            />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

type Props = {
  inv: ICapturedInvoice;
  rowIndex: number;
  mode: RowMode | undefined;
  detail: ICapturedInvoiceWithLines | undefined;
  postingId: string | null;
  suppliers: Supplier[];
  detailCache: Record<string, ICapturedInvoiceWithLines>;
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

export function InvoiceRow({
  inv,
  rowIndex,
  mode,
  detail,
  postingId,
  suppliers,
  detailCache,
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
  const modeKind = mode?.kind ?? RowModeKind.View;
  const isDraft = inv.status === InvoiceStatus.Draft;
  const isPosted = inv.status === InvoiceStatus.Posted;
  const isCreditNote = inv.status === InvoiceStatus.CreditNote;
  const isPosting = postingId === inv.id;
  const isExpanded = modeKind !== RowModeKind.View;
  const cancelView = () => onSetMode(inv.id, { kind: RowModeKind.View });

  return (
    <Fragment>
      <TableRow
        className={cn(
          'cursor-pointer group transition-colors',
          isDraft
            ? 'bg-amber-50/60 hover:bg-amber-100/60 dark:bg-amber-950/20 dark:hover:bg-amber-900/20'
            : 'hover:bg-muted/20',
          isExpanded && !isDraft && 'bg-muted/20',
          !isDraft && !isExpanded && rowIndex % 2 !== 0 && 'bg-black/[0.025]',
        )}
        onClick={() => onExpand(inv.id)}
      >
        <TableCell
          className={cn('w-8 p-2 align-middle', isDraft && 'border-l-[2.5px] border-l-amber-500')}
        >
          {isExpanded ? (
            <ChevronDownIcon
              className={cn(
                'size-3.5',
                isDraft ? 'text-amber-500' : 'text-[var(--nav-active-border)]',
              )}
            />
          ) : (
            <ChevronRightIcon
              className={cn(
                'size-3.5 transition-colors',
                isDraft
                  ? 'text-amber-400/50 group-hover:text-amber-500'
                  : 'text-muted-foreground/40 group-hover:text-muted-foreground',
              )}
            />
          )}
        </TableCell>
        <TableCell className="font-mono text-sm">{inv.invoiceNumber}</TableCell>
        <InvoiceDateCell
          inv={inv}
          isCreditNote={isCreditNote}
          suppliers={suppliers}
          detailCache={detailCache}
        />
        <InvoiceAmountCells detail={detail} />
        <TableCell>
          <StatusBadge status={inv.status} />
        </TableCell>
        <TableCell className="text-sm text-muted-foreground/60">
          {inv.updatedAt ? (
            formatDate(inv.updatedAt)
          ) : (
            <span className="opacity-40 italic">Never</span>
          )}
        </TableCell>
        <TableCell onClick={(e) => e.stopPropagation()}>
          <RowActions
            isPosted={isPosted}
            isPosting={isPosting}
            isCreditNote={isCreditNote}
            onReuse={() => onReuse(inv.id)}
            onEdit={() => onEditClick(inv.id)}
            onPost={() => onPost(inv.id)}
            onAudit={() => onAuditClick(inv.id)}
            onRaiseCreditNote={() => onRaiseCreditNoteClick(inv.id)}
          />
        </TableCell>
      </TableRow>
      <ExpansionPanels
        modeKind={modeKind}
        inv={inv}
        detail={detail}
        suppliers={suppliers}
        onSaveEdit={onSaveEdit}
        onMetadataSave={onMetadataSave}
        onSaveCreditNote={onSaveCreditNote}
        cancelView={cancelView}
      />
    </Fragment>
  );
}
