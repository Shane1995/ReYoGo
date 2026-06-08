import { type ComponentProps } from 'react';
import { Link } from 'react-router-dom';
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@reyogo/ui';
import { InvoiceRoutes } from '@/components/AppRoutes/routePaths';
import type { ICapturedInvoice, ICapturedInvoiceWithLines } from '@reyogo/types';
import type { SortDir } from '@/hooks/useTableSort';
import { InvoiceRow } from '../InvoiceRow';
import { SortableHead } from '../SortableHead';
import { type RowMode } from '../../types';

const COLUMN_COUNT = 10;

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  if (hasFilters) {
    return (
      <div className="rounded-lg border border-[var(--nav-border)] bg-muted/10 p-10 text-center text-sm text-muted-foreground/60">
        <p>No invoices match the current filters.</p>
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-[var(--nav-border)] bg-muted/10 p-10 text-center text-sm text-muted-foreground/60">
      <p>No captured invoices yet.</p>
      <Button asChild variant="link" className="mt-2">
        <Link to={InvoiceRoutes.Base}>Capture your first invoice</Link>
      </Button>
    </div>
  );
}

function DraftBanner({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <TableRow className="hover:bg-transparent border-none h-7">
      <TableCell
        colSpan={COLUMN_COUNT}
        className="py-1.5 px-3 border-l-[2.5px] border-l-amber-500 bg-amber-100 dark:bg-amber-900/40"
      >
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-amber-600 inline-block animate-pulse" />
          <span className="text-[10px] uppercase tracking-[0.14em] text-amber-900 dark:text-amber-200 font-semibold">
            {count} draft{count !== 1 ? 's' : ''} pending review
          </span>
        </div>
      </TableCell>
    </TableRow>
  );
}

function DraftDivider({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <TableRow className="hover:bg-transparent h-px">
      <TableCell colSpan={COLUMN_COUNT} className="p-0 bg-border/40" />
    </TableRow>
  );
}

export type RowProps = Omit<
  ComponentProps<typeof InvoiceRow>,
  'inv' | 'rowIndex' | 'mode' | 'detail'
>;

export type InvoiceHistoryTableProps = {
  drafts: ICapturedInvoice[];
  sortedPosted: ICapturedInvoice[];
  sortKey: string | null;
  sortDir: SortDir;
  toggleSort: (key: string) => void;
  rowMode: Record<string, RowMode>;
  detailCache: Record<string, ICapturedInvoiceWithLines | undefined>;
  rowProps: RowProps;
};

function InvoiceHistoryTable({
  drafts,
  sortedPosted,
  sortKey,
  sortDir,
  toggleSort,
  rowMode,
  detailCache,
  rowProps,
}: InvoiceHistoryTableProps) {
  return (
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
          <DraftBanner count={drafts.length} />
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
          <DraftDivider show={drafts.length > 0 && sortedPosted.length > 0} />
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
  );
}

export type InvoiceHistoryBodyProps = InvoiceHistoryTableProps & {
  loading: boolean;
  visibleInvoices: ICapturedInvoice[];
  hasFilters: boolean;
};

export function InvoiceHistoryBody({
  loading,
  visibleInvoices,
  hasFilters,
  ...tableProps
}: InvoiceHistoryBodyProps) {
  if (loading) return <p className="text-muted-foreground text-sm">Loading…</p>;
  if (visibleInvoices.length === 0) return <EmptyState hasFilters={hasFilters} />;
  return <InvoiceHistoryTable {...tableProps} />;
}
