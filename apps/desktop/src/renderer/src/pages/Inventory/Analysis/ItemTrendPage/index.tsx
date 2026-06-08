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
import type { ItemGroup } from '../types';

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

type Stats = {
  min: number;
  max: number;
  avg: number;
  first: number;
  last: number;
  change: number | null;
  count: number;
  uom: string | undefined;
};

function PriceStatCards({ stats }: { stats: Stats }) {
  const uomSuffix = stats.uom ? ` / ${stats.uom}` : '';
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard label="First price" value={`${fmt(stats.first)}${uomSuffix}`} />
      <StatCard label="Latest price" value={`${fmt(stats.last)}${uomSuffix}`} />
      <StatCard label="Average price" value={`${fmt(stats.avg)}${uomSuffix}`} muted />
      <StatCard
        label="Overall change"
        value={stats.change === null ? '—' : fmtPct(stats.change)}
        className={changeCls(stats.change, true)}
      />
    </div>
  );
}

function suffixOf(uom: string | undefined, prefix: string): string {
  if (!uom) return '';
  return `${prefix}${uom}`;
}

function weightedAvgCostLabel(costHistory: ItemCostHistory, uomSuffix: string): string {
  if (costHistory.weightedAvgCost == null) return '—';
  return `${fmt(costHistory.weightedAvgCost)}${uomSuffix}`;
}

function stockQuantityLabel(stock: number): string {
  if (stock % 1 === 0) return stock.toFixed(0);
  return stock.toFixed(2);
}

function currentStockLabel(costHistory: ItemCostHistory, stockSuffix: string): string {
  if (costHistory.totalStock == null) return '—';
  return `${stockQuantityLabel(costHistory.totalStock)}${stockSuffix}`;
}

function CostHistoryCards({
  costHistory,
  uom,
}: {
  costHistory: ItemCostHistory;
  uom: string | undefined;
}) {
  const uomSuffix = suffixOf(uom, ' / ');
  const stockSuffix = suffixOf(uom, ' ');
  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard
        label="Weighted avg cost"
        value={weightedAvgCostLabel(costHistory, uomSuffix)}
        muted
      />
      <StatCard label="Current stock" value={currentStockLabel(costHistory, stockSuffix)} muted />
    </div>
  );
}

function uomPartOf(stats: Stats): string {
  if (!stats.uom) return '';
  return ` · ${stats.uom}`;
}

function captureCountLabel(stats: Stats): string {
  if (stats.count === 1) return '1 capture';
  return `${stats.count} captures`;
}

function subtitleOf(group: ItemGroup, stats: Stats | null): string {
  const category = group.categoryName ?? group.categoryType;
  if (!stats) return category;
  return `${category}${uomPartOf(stats)} · ${captureCountLabel(stats)}`;
}

function ItemTrendHeader({
  group,
  stats,
  onBack,
}: {
  group: ItemGroup;
  stats: Stats | null;
  onBack: () => void;
}) {
  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        onClick={onBack}
        className="mt-1 flex items-center gap-1 text-xs font-medium uppercase tracking-widest text-muted-foreground/50 hover:text-foreground transition-colors shrink-0"
      >
        <ArrowLeftIcon className="size-3" />
        Back
      </button>
      <div>
        <h1 className="text-lg font-semibold text-foreground leading-tight">{group.name}</h1>
        <p className="text-sm text-muted-foreground/70 mt-0.5">{subtitleOf(group, stats)}</p>
      </div>
    </div>
  );
}

function useItemTrendData(itemId: string | undefined) {
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

  const stats = useMemo((): Stats | null => {
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

  return { loading, group, costHistory, chartData, stats };
}

function NotFoundScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="p-6">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-3.5" />
        Back to analysis
      </button>
      <p className="text-muted-foreground">Item not found.</p>
    </div>
  );
}

function uomOf(stats: Stats | null): string | undefined {
  if (!stats) return undefined;
  return stats.uom;
}

function avgPriceOf(stats: Stats | null): number {
  if (!stats) return 0;
  return stats.avg;
}

function StatsAndCostSection({
  stats,
  costHistory,
}: {
  stats: Stats | null;
  costHistory: ItemCostHistory | null;
}) {
  return (
    <>
      {stats && <PriceStatCards stats={stats} />}
      {costHistory && <CostHistoryCards costHistory={costHistory} uom={uomOf(stats)} />}
    </>
  );
}

export default function ItemTrendPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const { loading, group, costHistory, chartData, stats } = useItemTrendData(itemId);
  const goBack = () => navigate(AnalysisRoutes.CostPerUnit);

  if (loading) return <div className="p-6 text-muted-foreground">Loading…</div>;
  if (!group) return <NotFoundScreen onBack={goBack} />;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto p-5 space-y-5">
      <ItemTrendHeader group={group} stats={stats} onBack={goBack} />
      <StatsAndCostSection stats={stats} costHistory={costHistory} />
      <TrendChart chartData={chartData} avgPrice={avgPriceOf(stats)} uom={group.uom} />
      <TrendHistoryTable entries={group.entries} />
    </div>
  );
}
