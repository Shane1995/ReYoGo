import { useMemo, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';
import { stockMovementsService } from '@/services/stockMovements';
import type { ItemCostHistory } from '@reyogo/types';
import { useInventory } from '@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext';
import { useAnalysisLines } from '../hooks/useAnalysisLines';
import { buildItemGroups } from '../utils/buildItemGroups';
import { overallChangePct } from '../utils/stats';
import { fmt, fmtDate, fmtDateShort, fmtPct } from '../utils/format';
import { changeCls } from '../utils/styles';
import { AnalysisRoutes } from '@/components/AppRoutes/routePaths';
import { TrendChart } from './components/TrendChart';
import { TrendHistoryTable } from './components/TrendHistoryTable';

function StatCard({
  label,
  value,
  muted,
  className,
}: {
  label: string;
  value: string;
  muted?: boolean;
  className?: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--nav-border)] bg-background p-3">
      <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
        {label}
      </p>
      <p
        className={`mt-1.5 font-mono text-base font-semibold tabular-nums ${className ?? (muted ? 'text-muted-foreground' : 'text-foreground')}`}
      >
        {value}
      </p>
    </div>
  );
}

export default function ItemTrendPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const { lines, loading } = useAnalysisLines();
  const { items } = useInventory();
  const [costHistory, setCostHistory] = useState<ItemCostHistory | null>(null);

  useEffect(() => {
    if (!itemId) return;
    stockMovementsService
      .getItemCostHistory(itemId)
      .then(setCostHistory)
      .catch(() => {});
  }, [itemId]);

  const group = useMemo(() => {
    if (!itemId || !lines.length) return null;
    const groups = buildItemGroups(lines, '', '', items);
    return groups.find((g) => g.itemId === itemId) ?? null;
  }, [lines, itemId, items]);

  const chartData = useMemo(() => {
    if (!group) return [];
    return group.entries.map((e) => ({
      date: fmtDateShort(e.date),
      fullDate: fmtDate(e.date),
      price: e.unitPrice,
      qty: e.quantity,
    }));
  }, [group]);

  const stats = useMemo(() => {
    if (!group || !group.entries.length) return null;
    const prices = group.entries.map((e) => e.unitPrice);
    const first = prices[0]!;
    const last = prices[prices.length - 1]!;
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: prices.reduce((a, b) => a + b, 0) / prices.length,
      first,
      last,
      change: overallChangePct(group),
      count: group.entries.length,
      uom: group.uom,
    };
  }, [group]);

  const avgPrice = stats?.avg ?? 0;

  if (loading) {
    return <div className="p-6 text-muted-foreground">Loading…</div>;
  }

  if (!group) {
    return (
      <div className="p-6">
        <button
          type="button"
          onClick={() => navigate(AnalysisRoutes.CostPerUnit)}
          className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-3.5" />
          Back to analysis
        </button>
        <p className="text-muted-foreground">Item not found.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto p-5 space-y-5">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => navigate(AnalysisRoutes.CostPerUnit)}
          className="mt-1 flex items-center gap-1 text-xs font-medium uppercase tracking-widest text-muted-foreground/50 hover:text-foreground transition-colors shrink-0"
        >
          <ArrowLeftIcon className="size-3" />
          Back
        </button>
        <div>
          <h1 className="text-lg font-semibold text-foreground leading-tight">{group.name}</h1>
          <p className="text-sm text-muted-foreground/70 mt-0.5">
            {group.categoryName ?? group.categoryType}
            {stats?.uom ? ` · ${stats.uom}` : ''}
            {' · '}
            {stats?.count} capture{stats?.count !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="First price"
            value={`${fmt(stats.first)}${stats.uom ? ` / ${stats.uom}` : ''}`}
          />
          <StatCard
            label="Latest price"
            value={`${fmt(stats.last)}${stats.uom ? ` / ${stats.uom}` : ''}`}
          />
          <StatCard
            label="Average price"
            value={`${fmt(stats.avg)}${stats.uom ? ` / ${stats.uom}` : ''}`}
            muted
          />
          <StatCard
            label="Overall change"
            value={stats.change === null ? '—' : fmtPct(stats.change)}
            className={changeCls(stats.change, true)}
          />
        </div>
      )}

      {costHistory && (
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Weighted avg cost"
            value={
              costHistory.weightedAvgCost != null
                ? `${fmt(costHistory.weightedAvgCost)}${stats?.uom ? ` / ${stats.uom}` : ''}`
                : '—'
            }
            muted
          />
          <StatCard
            label="Current stock"
            value={
              costHistory.totalStock != null
                ? `${costHistory.totalStock % 1 === 0 ? costHistory.totalStock.toFixed(0) : costHistory.totalStock.toFixed(2)}${stats?.uom ? ` ${stats.uom}` : ''}`
                : '—'
            }
            muted
          />
        </div>
      )}

      <TrendChart chartData={chartData} avgPrice={avgPrice} uom={group.uom} />

      <TrendHistoryTable entries={group.entries} />
    </div>
  );
}
