import { useMemo, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react";
import { stockMovementsService } from "@/services/stockMovements";
import type { IItemCostHistory } from "@shared/types/contract";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { useAnalysisLines } from "../hooks/useAnalysisLines";
import { buildItemGroups } from "../utils/buildItemGroups";
import { overallChangePct } from "../utils/stats";
import { fmt, fmtDate, fmtDateShort, fmtPct } from "../utils/format";
import { changeCls } from "../utils/styles";
import { AnalysisRoutes } from "@/components/AppRoutes/routePaths";

export default function ItemTrendPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const { lines, loading } = useAnalysisLines();
  const [costHistory, setCostHistory] = useState<IItemCostHistory | null>(null);

  useEffect(() => {
    if (!itemId) return;
    stockMovementsService.getItemCostHistory(itemId)
      .then(setCostHistory)
      .catch(() => {});
  }, [itemId]);

  const group = useMemo(() => {
    if (!itemId || !lines.length) return null;
    const groups = buildItemGroups(lines, "", "");
    return groups.find((g) => g.itemId === itemId) ?? null;
  }, [lines, itemId]);

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
    const first = prices[0];
    const last = prices[prices.length - 1];
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
    <div className="flex min-h-0 flex-1 flex-col overflow-auto p-6 space-y-6">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => navigate(AnalysisRoutes.CostPerUnit)}
          className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground shrink-0"
        >
          <ArrowLeftIcon className="size-3.5" />
          Back
        </button>
        <div>
          <h1 className="text-lg font-semibold text-foreground">{group.name}</h1>
          <p className="text-sm text-muted-foreground">
            {group.categoryName ?? group.categoryType}
            {stats?.uom ? ` · ${stats.uom}` : ""}
            {" · "}{stats?.count} capture{stats?.count !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="First price" value={`${fmt(stats.first)}${stats.uom ? ` / ${stats.uom}` : ""}`} />
          <StatCard label="Latest price" value={`${fmt(stats.last)}${stats.uom ? ` / ${stats.uom}` : ""}`} />
          <StatCard label="Average price" value={`${fmt(stats.avg)}${stats.uom ? ` / ${stats.uom}` : ""}`} muted />
          <StatCard
            label="Overall change"
            value={stats.change === null ? "—" : fmtPct(stats.change)}
            className={changeCls(stats.change, true)}
          />
        </div>
      )}

      {costHistory && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
          <StatCard
            label="Weighted Avg Cost"
            value={costHistory.weightedAvgCost != null ? `${fmt(costHistory.weightedAvgCost)}${stats?.uom ? ` / ${stats.uom}` : ""}` : "—"}
            muted
          />
          <StatCard
            label="Current Stock"
            value={costHistory.totalStock != null
              ? `${costHistory.totalStock % 1 === 0 ? costHistory.totalStock.toFixed(0) : costHistory.totalStock.toFixed(2)}${stats?.uom ? ` ${stats.uom}` : ""}`
              : "—"}
            muted
          />
        </div>
      )}

      {chartData.length < 2 ? (
        <div className="rounded-xl border border-border bg-muted/20 p-10 text-center text-sm text-muted-foreground">
          Not enough data to show a trend — capture this item on at least 2 invoices.
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Price per unit over time (excl. VAT)
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={{ stroke: "#4b5563" }}
                axisLine={{ stroke: "#4b5563" }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={{ stroke: "#4b5563" }}
                axisLine={{ stroke: "#4b5563" }}
                tickFormatter={(v) => fmt(v)}
                width={52}
              />
              <Tooltip
                content={<PriceTip uom={group.uom} />}
              />
              <ReferenceLine
                y={avgPrice}
                stroke="#6b7280"
                strokeDasharray="4 4"
                strokeOpacity={0.6}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#6366f1" }}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="mt-2 text-center text-xs text-muted-foreground/60">
            Dashed line = average ({fmt(avgPrice)})
          </p>
        </div>
      )}

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary text-xs font-semibold uppercase tracking-wider text-foreground/80">
              <th className="px-4 py-2.5 text-left">Date</th>
              <th className="px-4 py-2.5 text-right">Qty</th>
              <th className="px-4 py-2.5 text-right">Unit Price</th>
              <th className="px-4 py-2.5 text-right">vs Previous</th>
            </tr>
          </thead>
          <tbody>
            {group.entries.map((e, i) => {
              const prev = i > 0 ? group.entries[i - 1].unitPrice : null;
              const diff = prev !== null && prev > 0 ? ((e.unitPrice - prev) / prev) * 100 : null;
              return (
                <tr key={`${e.invoiceId}-${i}`} className={i % 2 === 1 ? "bg-white/[0.03]" : ""}>
                  <td className="px-4 py-2.5 text-muted-foreground">{fmtDate(e.date)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                    {e.quantity}{e.uom ? ` ${e.uom}` : ""}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-medium text-foreground">
                    {fmt(e.unitPrice)}
                  </td>
                  <td className={`px-4 py-2.5 text-right ${changeCls(diff)}`}>
                    {diff === null ? "—" : fmtPct(diff)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

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
    <div className="rounded-lg border border-border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 font-mono text-base font-semibold ${className ?? (muted ? "text-muted-foreground" : "text-foreground")}`}>
        {value}
      </p>
    </div>
  );
}

function PriceTip({ active, payload, uom }: { active?: boolean; payload?: {payload: {fullDate: string; price: number; qty: number}}[]; uom?: string }) {
  if (!active || !payload?.length) return null;
  const { fullDate, price, qty } = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-md">
      <p className="text-muted-foreground">{fullDate}</p>
      <p className="font-mono font-semibold text-foreground">{fmt(price)}{uom ? ` / ${uom}` : ""}</p>
      <p className="text-xs text-muted-foreground">qty: {qty}</p>
    </div>
  );
}
