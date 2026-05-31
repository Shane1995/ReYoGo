import { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, PageHeader, DateRangePicker, cn } from '@reyogo/ui';
import { InvoiceStatus } from '@reyogo/types';
import { InvoiceRoutes } from '@/components/AppRoutes/routePaths';
import { useEntities } from '@/Context/EntityContext';
import { EntityFilter } from '@/components/EntityFilter';
import { ReceiptIcon, ChevronDownIcon, ChevronRightIcon, SearchIcon, XIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@reyogo/ui';
import { EditPanel } from './components/EditPanel';
import { MetadataEditPanel } from './components/MetadataEditPanel';
import { AuditPanel } from './components/AuditPanel';
import { RaiseCreditNotePanel } from './components/RaiseCreditNotePanel';
import { StatusBadge } from './components/StatusBadge';
import { RowActions } from './components/RowActions';
import { InvoiceDetailLines } from './components/InvoiceDetailLines';
import { useInvoiceHistory } from './hooks/useInvoiceHistory';
import { RowModeKind } from './types';
import { formatDate } from '../utils/formatDate';
import { formatMoney } from '../utils/formatMoney';
import { invoiceTotals } from '../utils/invoiceTotals';
import type { ICapturedInvoice } from '@reyogo/types';

const COLUMN_COUNT = 10;

const fieldLabel =
  'text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 mb-1 block';
const selectBase =
  'h-8 rounded-md border border-input bg-background px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--nav-active-border)]/50 pr-7';

export default function InvoiceHistoryPage() {
  const {
    invoices,
    loading,
    detailCache,
    rowMode,
    setMode,
    search,
    setSearch,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    supplierFilter,
    setSupplierFilter,
    suppliers,
    hasFilters,
    clearFilters,
    handleReuse,
    handleExpandDetail,
    handleEditClick,
    handleAuditClick,
    handleSaveEdit,
    handleMetadataSave,
    handlePost,
    postingId,
    handleRaiseCreditNoteClick,
    handleSaveCreditNote,
  } = useInvoiceHistory();

  const { entities } = useEntities();
  const [entityFilter, setEntityFilter] = useState<string | null>(null);

  const visibleInvoices = entityFilter
    ? invoices.filter((inv) => inv.entityId === entityFilter)
    : invoices;

  const drafts = visibleInvoices.filter((inv) => inv.status === InvoiceStatus.Draft);
  const posted = visibleInvoices.filter((inv) => inv.status !== InvoiceStatus.Draft);

  const renderRow = (inv: ICapturedInvoice) => {
    const mode = rowMode[inv.id]?.kind ?? RowModeKind.View;
    const detail = detailCache[inv.id];
    const totals = detail ? invoiceTotals(detail) : null;
    const isDraft = inv.status === InvoiceStatus.Draft;
    const isPosted = inv.status === InvoiceStatus.Posted;
    const isCreditNote = inv.status === InvoiceStatus.CreditNote;
    const isPosting = postingId === inv.id;
    const isExpanded =
      mode === RowModeKind.Detail ||
      mode === RowModeKind.Edit ||
      mode === RowModeKind.MetadataEdit ||
      mode === RowModeKind.Audit ||
      mode === RowModeKind.CreditNote;

    return (
      <Fragment key={inv.id}>
        <TableRow
          className={cn(
            'cursor-pointer group transition-colors',
            isDraft
              ? 'bg-amber-50/60 hover:bg-amber-100/60 dark:bg-amber-950/20 dark:hover:bg-amber-900/20'
              : 'hover:bg-muted/20',
            isExpanded && !isDraft && 'bg-muted/20',
          )}
          onClick={() => handleExpandDetail(inv.id)}
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
              onReuse={() => handleReuse(inv.id)}
              onEdit={() => handleEditClick(inv.id)}
              onPost={() => handlePost(inv.id)}
              onAudit={() => handleAuditClick(inv.id)}
              onRaiseCreditNote={() => handleRaiseCreditNoteClick(inv.id)}
            />
          </TableCell>
        </TableRow>

        {mode === RowModeKind.Detail && detail && (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={COLUMN_COUNT} className="p-0">
              <div className="border-t border-[var(--nav-border)] bg-[var(--nav-accent)]/30 px-6 py-4">
                <InvoiceDetailLines invoice={detail} />
              </div>
            </TableCell>
          </TableRow>
        )}

        {mode === RowModeKind.Edit && detail && (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={COLUMN_COUNT} className="p-0">
              <EditPanel
                invoice={detail}
                onSave={(lines, note) => handleSaveEdit(inv, lines, note)}
                onCancel={() => setMode(inv.id, { kind: RowModeKind.View })}
              />
            </TableCell>
          </TableRow>
        )}

        {mode === RowModeKind.MetadataEdit && detail && (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={COLUMN_COUNT} className="p-0">
              <MetadataEditPanel
                invoice={detail}
                suppliers={suppliers}
                onSave={(fields) => handleMetadataSave(inv.id, fields)}
                onCancel={() => setMode(inv.id, { kind: RowModeKind.View })}
              />
            </TableCell>
          </TableRow>
        )}

        {mode === RowModeKind.Audit && (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={COLUMN_COUNT} className="p-0">
              <AuditPanel
                invoiceId={inv.id}
                suppliers={suppliers}
                onClose={() => setMode(inv.id, { kind: RowModeKind.View })}
              />
            </TableCell>
          </TableRow>
        )}

        {mode === RowModeKind.CreditNote && detail && (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={COLUMN_COUNT} className="p-0">
              <RaiseCreditNotePanel
                invoice={detail}
                onConfirm={handleSaveCreditNote}
                onCancel={() => setMode(inv.id, { kind: RowModeKind.View })}
              />
            </TableCell>
          </TableRow>
        )}
      </Fragment>
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Invoice History"
        description="Past captured invoices. Click a row to expand details, or edit with full audit trail."
        actions={
          <Button asChild size="sm">
            <Link to={InvoiceRoutes.Base} className="inline-flex items-center gap-2">
              <ReceiptIcon className="size-4" aria-hidden />
              Capture new
            </Link>
          </Button>
        }
      >
        <div className="space-y-3">
          <EntityFilter entities={entities} selected={entityFilter} onChange={setEntityFilter} />
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/40 pointer-events-none" />
            <input
              type="search"
              placeholder="Search by item name or invoice number…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                'h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm',
                'font-[family-name:var(--font-mono,_DM_Mono,_monospace)] placeholder:font-sans placeholder:text-muted-foreground/40',
                'focus:outline-none focus:ring-2 focus:ring-[var(--nav-active-border)]/50 transition-shadow',
                search && 'border-[var(--primary)]/40',
              )}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground transition-colors"
              >
                <XIcon className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-end gap-x-4 gap-y-2.5">
            {suppliers.length > 0 && (
              <div className="flex flex-col">
                <label className={fieldLabel}>Supplier</label>
                <select
                  value={supplierFilter}
                  onChange={(e) => setSupplierFilter(e.target.value)}
                  className={cn(selectBase, 'w-44', !supplierFilter && 'text-muted-foreground/60')}
                >
                  <option value="">All suppliers</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="h-6 w-px bg-border/60 self-end mb-1 hidden sm:block" />

            <div className="flex flex-col">
              <label className={fieldLabel}>Date range</label>
              <DateRangePicker
                from={fromDate}
                to={toDate}
                onChange={(f, t) => {
                  setFromDate(f);
                  setToDate(t);
                }}
              />
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1 self-end mb-0.5 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/50 hover:text-foreground transition-colors"
              >
                <XIcon className="size-3" />
                Clear all
              </button>
            )}
          </div>
        </div>
      </PageHeader>

      <div className="min-h-0 flex-1 overflow-auto p-4">
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading…</p>
        ) : visibleInvoices.length === 0 ? (
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
                  <TableHead className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70">
                    Invoice #
                  </TableHead>
                  <TableHead className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70">
                    Date
                  </TableHead>
                  <TableHead className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 w-14 text-right">
                    Lines
                  </TableHead>
                  <TableHead className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 w-28 text-right">
                    Excl.
                  </TableHead>
                  <TableHead className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 w-24 text-right">
                    VAT
                  </TableHead>
                  <TableHead className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 w-28 text-right">
                    Total
                  </TableHead>
                  <TableHead className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 w-24">
                    Status
                  </TableHead>
                  <TableHead className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 w-36">
                    Last edited
                  </TableHead>
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

                {drafts.map(renderRow)}

                {drafts.length > 0 && posted.length > 0 && (
                  <TableRow className="hover:bg-transparent h-px">
                    <TableCell colSpan={COLUMN_COUNT} className="p-0 bg-border/40" />
                  </TableRow>
                )}

                {posted.map(renderRow)}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
