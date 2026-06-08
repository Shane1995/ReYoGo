import { useEffect, useState } from 'react';
import { PageHeader, DatePicker, cn } from '@reyogo/ui';
import { stockMovementsService } from '@/services/stockMovements';
import { useEntities } from '@/Context/EntityContext';
import type { COGSSummary } from '@reyogo/types';

function fmt(n: number) {
  return n.toLocaleString('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
  });
}

function DateRangeFilter({
  fromDate,
  toDate,
  onFromChange,
  onToChange,
}: {
  fromDate: string;
  toDate: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 text-sm">
      <div className="flex items-center gap-1.5">
        <label className="text-muted-foreground shrink-0">From</label>
        <DatePicker value={fromDate} onChange={onFromChange} />
      </div>
      <div className="flex items-center gap-1.5">
        <label className="text-muted-foreground shrink-0">To</label>
        <DatePicker value={toDate} onChange={onToChange} />
      </div>
      {(fromDate || toDate) && (
        <button
          type="button"
          onClick={() => {
            onFromChange('');
            onToChange('');
          }}
          className="text-xs text-muted-foreground underline hover:text-foreground"
        >
          Clear
        </button>
      )}
    </div>
  );
}

function categoryRowKey(row: COGSSummary['byCategory'][number], i: number): string | number {
  return row.categoryId ?? i;
}

function categoryNameOf(row: COGSSummary['byCategory'][number]): string {
  return row.categoryName ?? 'Uncategorised';
}

function cogsSharePctOf(rowTotal: number, total: number): string {
  if (total <= 0) return '—';
  return `${((rowTotal / total) * 100).toFixed(1)}%`;
}

function CogsCategoryTable({ cogs }: { cogs: COGSSummary }) {
  if (cogs.byCategory.length === 0) return null;
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary text-xs font-semibold uppercase tracking-wider text-foreground/80">
            <th className="px-4 py-2.5 text-left">Category</th>
            <th className="px-4 py-2.5 text-right">COGS</th>
            <th className="px-4 py-2.5 text-right">% of Total</th>
          </tr>
        </thead>
        <tbody>
          {cogs.byCategory.map((row, i) => (
            <tr key={categoryRowKey(row, i)} className={cn(i % 2 !== 0 && 'bg-black/[0.025]')}>
              <td className="px-4 py-2.5 text-muted-foreground">{categoryNameOf(row)}</td>
              <td className="px-4 py-2.5 text-right font-mono font-medium text-foreground">
                {fmt(row.total)}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                {cogsSharePctOf(row.total, cogs.total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function cogsTotalLabel(cogs: COGSSummary | null): string {
  if (!cogs) return '—';
  return fmt(cogs.total);
}

function CogsTotalHint({ cogs }: { cogs: COGSSummary | null }) {
  if (cogs?.total) return null;
  return (
    <p className="mt-1 text-xs text-muted-foreground">
      COGS populates when stock OUT movements are recorded.
    </p>
  );
}

function CogsTotalCard({ cogs }: { cogs: COGSSummary | null }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Total COGS
      </p>
      <p className="mt-1 font-mono text-2xl font-semibold text-foreground">
        {cogsTotalLabel(cogs)}
      </p>
      <CogsTotalHint cogs={cogs} />
    </div>
  );
}

function CogsContent({ cogs }: { cogs: COGSSummary | null }) {
  return (
    <>
      <CogsTotalCard cogs={cogs} />
      {cogs && <CogsCategoryTable cogs={cogs} />}
    </>
  );
}

export default function CostingDashboard() {
  const { selectedEntityId } = useEntities();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [cogs, setCogs] = useState<COGSSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    stockMovementsService
      .getCOGS(fromDate || undefined, toDate || undefined, selectedEntityId || undefined)
      .then(setCogs)
      .catch(() => setCogs(null))
      .finally(() => setLoading(false));
  }, [fromDate, toDate, selectedEntityId]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title="Costing Dashboard" description="Cost of Goods Used (COGS) summary.">
        <div className="space-y-2.5">
          <DateRangeFilter
            fromDate={fromDate}
            toDate={toDate}
            onFromChange={setFromDate}
            onToChange={setToDate}
          />
        </div>
      </PageHeader>
      <div className="min-h-0 flex-1 overflow-auto p-4 space-y-4">
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading…</p>
        ) : (
          <CogsContent cogs={cogs} />
        )}
      </div>
    </div>
  );
}
