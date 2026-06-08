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
import { InvoiceDateCell } from './InvoiceDateCell';
import { InvoiceAmountCells } from './InvoiceAmountCells';
import { ExpansionPanels } from './ExpansionPanels';
import { formatDate } from '../../../utils/formatDate';
import type { ProcessReceiptLine } from '../../../types';

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

function isAlternateRow(isDraft: boolean, isExpanded: boolean, rowIndex: number): boolean {
  if (isDraft || isExpanded) return false;
  return rowIndex % 2 !== 0;
}

function draftRowClass(isDraft: boolean): string {
  if (isDraft) {
    return 'bg-amber-50/60 hover:bg-amber-100/60 dark:bg-amber-950/20 dark:hover:bg-amber-900/20';
  }
  return 'hover:bg-muted/20';
}

function expandedRowClass(isDraft: boolean, isExpanded: boolean): string | false {
  if (isDraft) return false;
  return isExpanded && 'bg-muted/20';
}

function rowClassName(isDraft: boolean, isExpanded: boolean, rowIndex: number): string {
  return cn(
    'cursor-pointer group transition-colors',
    draftRowClass(isDraft),
    expandedRowClass(isDraft, isExpanded),
    isAlternateRow(isDraft, isExpanded, rowIndex) && 'bg-black/[0.025]',
  );
}

function ExpandIcon({ isDraft, isExpanded }: { isDraft: boolean; isExpanded: boolean }) {
  if (isExpanded) {
    return (
      <ChevronDownIcon
        className={cn('size-3.5', isDraft ? 'text-amber-500' : 'text-[var(--nav-active-border)]')}
      />
    );
  }
  return (
    <ChevronRightIcon
      className={cn(
        'size-3.5 transition-colors',
        isDraft
          ? 'text-amber-400/50 group-hover:text-amber-500'
          : 'text-muted-foreground/40 group-hover:text-muted-foreground',
      )}
    />
  );
}

function UpdatedAtCell({ updatedAt }: { updatedAt: Date | null | undefined }) {
  return (
    <TableCell className="text-sm text-muted-foreground/60">
      {updatedAt ? formatDate(updatedAt) : <span className="opacity-40 italic">Never</span>}
    </TableCell>
  );
}

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
        className={rowClassName(isDraft, isExpanded, rowIndex)}
        onClick={() => onExpand(inv.id)}
      >
        <TableCell
          className={cn('w-8 p-2 align-middle', isDraft && 'border-l-[2.5px] border-l-amber-500')}
        >
          <ExpandIcon isDraft={isDraft} isExpanded={isExpanded} />
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
        <UpdatedAtCell updatedAt={inv.updatedAt} />
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
