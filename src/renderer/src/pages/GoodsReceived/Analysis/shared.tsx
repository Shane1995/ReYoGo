import { useEffect, useRef, useState } from "react";
import { InvoicesIPC } from "@shared/types/ipc";
import type { IInvoiceLineWithDate } from "@shared/types/contract";
import { cn } from "@/lib/utils";

// ── Formatting helpers ────────────────────────────────────────────────────────

export function fmt(n: number) {
  return n.toFixed(2);
}

export function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString(undefined, { dateStyle: "medium" });
}

export function fmtDateShort(d: Date) {
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function fmtPct(n: number) {
  return `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
}

// ── Domain types ──────────────────────────────────────────────────────────────

export type ItemEntry = {
  invoiceId: string;
  date: Date;
  quantity: number;
  unitPrice: number;
  uom?: string;
};

export type ItemGroup = {
  itemId: string;
  name: string;
  uom?: string;
  categoryType: string;
  entries: ItemEntry[];
};

export type Metric = "price" | "change";

export const TYPE_ORDER = ["food", "drink", "non-perishable"];
export const TYPE_LABELS: Record<string, string> = {
  food: "Foods",
  drink: "Drinks",
  "non-perishable": "Non-perishable",
};

export function typeLabel(t: string) {
  return TYPE_LABELS[t] ?? t.charAt(0).toUpperCase() + t.slice(1);
}

// ── Data processing ───────────────────────────────────────────────────────────

export function buildItemGroups(
  lines: IInvoiceLineWithDate[],
  fromDate: string,
  toDate: string
): ItemGroup[] {
  const from = fromDate ? new Date(fromDate + "T00:00:00") : null;
  const to = toDate ? new Date(toDate + "T23:59:59") : null;

  const map = new Map<string, ItemGroup>();
  for (const line of lines) {
    if (line.quantity <= 0) continue;
    const date = new Date(line.createdAt);
    if (from && date < from) continue;
    if (to && date > to) continue;

    if (!map.has(line.itemId)) {
      map.set(line.itemId, {
        itemId: line.itemId,
        name: line.itemNameSnapshot,
        categoryType: line.categoryType ?? "other",
        entries: [],
      });
    }
    const group = map.get(line.itemId)!;
    group.name = line.itemNameSnapshot;
    group.uom = line.unitOfMeasure ?? undefined;
    group.categoryType = line.categoryType ?? group.categoryType;
    group.entries.push({
      invoiceId: line.invoiceId,
      date,
      quantity: line.quantity,
      unitPrice: line.totalVatExclude / line.quantity,
      uom: line.unitOfMeasure ?? undefined,
    });
  }

  return Array.from(map.values())
    .filter((g) => g.entries.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
}

// ── Shared helpers ────────────────────────────────────────────────────────────

export function segBtn(active: boolean) {
  return cn(
    "rounded-md px-3 py-1 text-sm transition-colors",
    active ? "bg-[var(--nav-active-border)] text-white" : "text-muted-foreground hover:text-foreground"
  );
}

export function overallChangePct(group: ItemGroup): number | null {
  const first = group.entries[0].unitPrice;
  const last = group.entries[group.entries.length - 1].unitPrice;
  return group.entries.length > 1 && first > 0 ? ((last - first) / first) * 100 : null;
}

export function changeCls(v: number | null, bold = false) {
  return cn(
    "font-mono",
    bold && "font-semibold",
    v === null ? "text-muted-foreground"
    : v > 0 ? "text-destructive"
    : v < 0 ? "text-green-600 dark:text-green-500"
    : "text-muted-foreground"
  );
}

// ── Data hook ─────────────────────────────────────────────────────────────────

export function useAnalysisLines() {
  const [lines, setLines] = useState<IInvoiceLineWithDate[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await window.electronAPI.ipcRenderer.invoke(
          InvoicesIPC.GET_LINES_FOR_ANALYSIS
        );
        if (!cancelled) setLines(Array.isArray(data) ? data : []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);
  return { lines, loading };
}

// ── Summary table (All tab) ───────────────────────────────────────────────────

export function SummaryTableView({
  groups,
  onItemClick,
  onCategoryClick,
}: {
  groups: ItemGroup[];
  onItemClick: (itemId: string) => void;
  onCategoryClick: (categoryType: string) => void;
}) {
  if (groups.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--nav-border)] bg-muted/20 p-10 text-center text-muted-foreground">
        No data for the selected range or search.
      </div>
    );
  }

  const sectionMap = new Map<string, ItemGroup[]>();
  for (const g of groups) {
    if (!sectionMap.has(g.categoryType)) sectionMap.set(g.categoryType, []);
    sectionMap.get(g.categoryType)!.push(g);
  }
  const sections = [
    ...TYPE_ORDER.filter((t) => sectionMap.has(t)).map((t) => ({ type: t, groups: sectionMap.get(t)! })),
    ...Array.from(sectionMap.entries()).filter(([t]) => !TYPE_ORDER.includes(t)).map(([t, gs]) => ({ type: t, groups: gs })),
  ];

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.type}>
          <button
            type="button"
            onClick={() => onCategoryClick(section.type)}
            className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors group"
          >
            {typeLabel(section.type)}
            <span className="opacity-0 group-hover:opacity-60 text-[10px]">→</span>
          </button>
          <div className="rounded-lg border border-[var(--nav-border)] overflow-hidden bg-background">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--nav-border)] bg-muted/30">
                  <th className="py-2 px-4 text-left font-medium text-foreground">Item</th>
                  <th className="py-2 px-4 text-center font-medium text-foreground">Entries</th>
                  <th className="py-2 px-4 text-right font-medium text-foreground">Min</th>
                  <th className="py-2 px-4 text-right font-medium text-foreground">Avg</th>
                  <th className="py-2 px-4 text-right font-medium text-foreground">Last captured</th>
                  <th className="py-2 px-4 text-right font-medium text-foreground">Last price (excl. VAT)</th>
                  <th className="py-2 px-4 text-right font-medium text-foreground">Overall change</th>
                </tr>
              </thead>
              <tbody>
                {section.groups.map((group, gi) => {
                  const last = group.entries[group.entries.length - 1];
                  const change = overallChangePct(group);
                  const minPrice = Math.min(...group.entries.map((e) => e.unitPrice));
                  const avgPrice = group.entries.reduce((s, e) => s + e.unitPrice, 0) / group.entries.length;
                  return (
                    <tr
                      key={group.itemId}
                      onClick={() => onItemClick(group.itemId)}
                      className={cn(
                        "border-b border-[var(--nav-border)]/50 cursor-pointer hover:bg-muted/20",
                        gi % 2 === 0 ? "bg-background" : "bg-muted/10"
                      )}
                    >
                      <td className="py-2 px-4 font-medium text-foreground">{group.name}</td>
                      <td className="py-2 px-4 text-center text-muted-foreground">{group.entries.length}</td>
                      <td className="py-2 px-4 text-right font-mono text-muted-foreground">{fmt(minPrice)}</td>
                      <td className="py-2 px-4 text-right font-mono text-muted-foreground">{fmt(avgPrice)}</td>
                      <td className="py-2 px-4 text-right text-muted-foreground">{fmtDate(last.date)}</td>
                      <td className="py-2 px-4 text-right font-mono font-medium text-foreground">
                        {fmt(last.unitPrice)}{last.uom ? ` / ${last.uom}` : ""}
                      </td>
                      <td className={cn("py-2 px-4 text-right", changeCls(change, true))}>
                        {change === null ? "—" : fmtPct(change)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Detail table (type tabs) ──────────────────────────────────────────────────

export function TableView({ groups, onItemClick }: { groups: ItemGroup[]; onItemClick: (itemId: string) => void }) {
  if (groups.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--nav-border)] bg-muted/20 p-10 text-center text-muted-foreground">
        No data for the selected range or search.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--nav-border)] overflow-hidden bg-background">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--nav-border)] bg-muted/30">
            <th className="py-2 px-4 text-left font-medium text-foreground">Item</th>
            <th className="py-2 px-4 text-left font-medium text-foreground">Last captured</th>
            <th className="py-2 px-4 text-right font-medium text-foreground">Last unit price (excl. VAT)</th>
            <th className="py-2 px-4 text-right font-medium text-foreground">Overall change</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group, gi) => {
            const last = group.entries[group.entries.length - 1];
            const change = overallChangePct(group);
            return (
              <tr
                key={group.itemId}
                onClick={() => onItemClick(group.itemId)}
                className={cn(
                  "border-b border-[var(--nav-border)]/50 cursor-pointer hover:bg-muted/20",
                  gi % 2 === 0 ? "bg-background" : "bg-muted/10"
                )}
              >
                <td className="py-2 px-4 font-medium text-foreground">{group.name}</td>
                <td className="py-2 px-4 text-muted-foreground">{fmtDate(last.date)}</td>
                <td className="py-2 px-4 text-right font-mono font-medium text-foreground">
                  {fmt(last.unitPrice)}{last.uom ? ` / ${last.uom}` : ""}
                </td>
                <td className={cn("py-2 px-4 text-right", changeCls(change, true))}>
                  {change === null ? "—" : fmtPct(change)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Category insights banner ──────────────────────────────────────────────────

export function CategoryInsightsBanner({ groups, categoryType }: { groups: ItemGroup[]; categoryType: string }) {
  const withChange = groups
    .map((g) => ({ name: g.name, change: overallChangePct(g) }))
    .filter((c): c is { name: string; change: number } => c.change !== null);
  const increased = withChange.filter((c) => c.change > 0).length;
  const decreased = withChange.filter((c) => c.change < 0).length;
  const avgChange = withChange.length > 0
    ? withChange.reduce((s, c) => s + c.change, 0) / withChange.length
    : null;
  const sorted = [...withChange].sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  const maxAbs = sorted.length > 0 ? Math.max(...sorted.map((c) => Math.abs(c.change))) : 1;
  const shown = sorted.slice(0, 5);

  return (
    <div className="mb-4 rounded-lg border border-[var(--nav-border)] bg-background p-4">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            {typeLabel(categoryType)} insights
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{groups.length} item{groups.length !== 1 ? "s" : ""}</span>
            {increased > 0 && <span className="text-destructive">{increased} up</span>}
            {decreased > 0 && <span className="text-green-600 dark:text-green-500">{decreased} down</span>}
          </div>
        </div>
        {avgChange !== null && (
          <span className={cn(
            "shrink-0 rounded-full px-2.5 py-0.5 text-sm font-semibold font-mono",
            avgChange > 0 ? "bg-destructive/10 text-destructive"
            : avgChange < 0 ? "bg-green-600/10 text-green-600 dark:text-green-500"
            : "bg-muted text-muted-foreground"
          )}>
            avg {fmtPct(avgChange)}
          </span>
        )}
      </div>
      {shown.length > 0 ? (
        <div className="space-y-0.5">
          {shown.map((c) => (
            <ItemChangeBar key={c.name} name={c.name} change={c.change} maxAbs={maxAbs} />
          ))}
          {sorted.length > shown.length && (
            <p className="pt-1 text-xs text-muted-foreground">
              +{sorted.length - shown.length} more in table below
            </p>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          No price change data yet — items need at least two captures.
        </p>
      )}
    </div>
  );
}

// ── Sparkline ─────────────────────────────────────────────────────────────────

const SW = 140;
const SH = 44;

export function Sparkline({ entries }: { entries: ItemEntry[] }) {
  if (entries.length < 2) {
    const change = overallChangePct({ itemId: "", name: "", categoryType: "", entries });
    const color = change === null ? "#94a3b8" : change > 0 ? "#dc2626" : "#16a34a";
    return (
      <svg viewBox={`0 0 ${SW} ${SH}`} width={SW} height={SH}>
        <circle cx={SW / 2} cy={SH / 2} r={3} fill={color} />
      </svg>
    );
  }

  const prices = entries.map((e) => e.unitPrice);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const rangeP = maxP - minP || 1;

  const times = entries.map((e) => e.date.getTime());
  const minT = Math.min(...times);
  const maxT = Math.max(...times);
  const rangeT = maxT - minT || 1;

  const pad = { t: 4, b: 4, l: 4, r: 4 };
  const w = SW - pad.l - pad.r;
  const h = SH - pad.t - pad.b;

  const px = (t: number) => pad.l + ((t - minT) / rangeT) * w;
  const py = (p: number) => pad.t + (1 - (p - minP) / rangeP) * h;

  const pts = entries.map((e) => ({ x: px(e.date.getTime()), y: py(e.unitPrice) }));
  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaD = `${pathD} L${pts[pts.length - 1].x.toFixed(1)} ${pad.t + h} L${pts[0].x.toFixed(1)} ${pad.t + h} Z`;

  const change = overallChangePct({ itemId: "", name: "", categoryType: "", entries });
  const color = change === null ? "#94a3b8" : change > 0 ? "#dc2626" : "#16a34a";

  return (
    <svg viewBox={`0 0 ${SW} ${SH}`} width={SW} height={SH}>
      <path d={areaD} fill={color} fillOpacity={0.1} stroke="none" />
      <path d={pathD} fill="none" stroke={color} strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={2.5} fill={color} />
      ))}
    </svg>
  );
}

// ── Item card grid ────────────────────────────────────────────────────────────

export function ItemCard({ group, onSelect }: { group: ItemGroup; onSelect: () => void }) {
  const last = group.entries[group.entries.length - 1];
  const change = overallChangePct(group);
  const minPrice = Math.min(...group.entries.map((e) => e.unitPrice));
  const maxPrice = Math.max(...group.entries.map((e) => e.unitPrice));

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex flex-col gap-3 rounded-lg border border-[var(--nav-border)] bg-background p-4 text-left transition-colors hover:bg-muted/20 hover:border-[var(--nav-active-border)]/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nav-active-border)]/50"
    >
      <div className="flex items-start justify-between gap-2 min-w-0">
        <div className="min-w-0">
          <p className="truncate font-medium text-sm text-foreground">{group.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{group.uom ?? "no UoM"}</p>
        </div>
        {change !== null && (
          <span className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold font-mono",
            change > 0
              ? "bg-destructive/10 text-destructive"
              : change < 0
              ? "bg-green-600/10 text-green-600 dark:text-green-500"
              : "bg-muted text-muted-foreground"
          )}>
            {fmtPct(change)}
          </span>
        )}
      </div>
      <div className="w-full overflow-hidden rounded">
        <Sparkline entries={group.entries} />
      </div>
      <div className="grid grid-cols-3 gap-1 text-xs">
        <div>
          <p className="text-muted-foreground">Last price</p>
          <p className="font-mono font-medium text-foreground mt-0.5">{fmt(last.unitPrice)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Range</p>
          <p className="font-mono text-foreground mt-0.5">{fmt(minPrice)}–{fmt(maxPrice)}</p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground">Captures</p>
          <p className="font-medium text-foreground mt-0.5">{group.entries.length}</p>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground -mt-1">Last: {fmtDate(last.date)}</p>
    </button>
  );
}

export function ItemGrid({ groups, onSelect }: { groups: ItemGroup[]; onSelect: (id: string) => void }) {
  if (groups.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--nav-border)] bg-muted/20 p-10 text-center text-muted-foreground">
        No items found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
      {groups.map((g) => (
        <ItemCard key={g.itemId} group={g} onSelect={() => onSelect(g.itemId)} />
      ))}
    </div>
  );
}

// ── Item detail chart ─────────────────────────────────────────────────────────

const DC = { w: 800, h: 300, pt: 20, pr: 24, pb: 48, pl: 68 };
const dPlotW = DC.w - DC.pl - DC.pr;
const dPlotH = DC.h - DC.pt - DC.pb;

type DetailTooltip = {
  screenXPx: number;
  svgWidthPx: number;
  entry: ItemEntry;
  entryIdx: number;
  changeFromFirst: number | null;
  changeFromPrev: number | null;
};

export function ItemDetailChart({ group, metric }: { group: ItemGroup; metric: Metric }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<DetailTooltip | null>(null);

  const getYValue = (entry: ItemEntry) => {
    if (metric === "price") return entry.unitPrice;
    const baseline = group.entries[0].unitPrice;
    if (baseline === 0) return 0;
    return ((entry.unitPrice - baseline) / baseline) * 100;
  };

  const times = group.entries.map((e) => e.date.getTime());
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);

  const yValues = group.entries.map(getYValue);
  const rawYMin = Math.min(...yValues);
  const rawYMax = Math.max(...yValues);
  const yPad = Math.abs(rawYMax - rawYMin) * 0.2 || (metric === "price" ? rawYMax * 0.1 : 5);
  const yMin = metric === "change" ? Math.min(rawYMin - yPad, -5) : Math.max(0, rawYMin - yPad);
  const yMax = rawYMax + yPad;

  const xScale = (t: number) => {
    if (maxTime === minTime) return DC.pl + dPlotW / 2;
    return DC.pl + ((t - minTime) / (maxTime - minTime)) * dPlotW;
  };

  const yScale = (v: number) => {
    if (yMax === yMin) return DC.pt + dPlotH / 2;
    return DC.pt + (1 - (v - yMin) / (yMax - yMin)) * dPlotH;
  };

  const yTicks = Array.from({ length: 5 }, (_, i) => yMin + (i / 4) * (yMax - yMin));
  const xTickCount = Math.min(7, Math.max(2, group.entries.length));
  const xTicks = Array.from({ length: xTickCount }, (_, i) =>
    new Date(minTime + (i / Math.max(xTickCount - 1, 1)) * (maxTime - minTime))
  );

  const zeroY = metric === "change" ? yScale(0) : null;
  const firstPriceY = metric === "price" && group.entries.length > 1 ? yScale(group.entries[0].unitPrice) : null;

  const pts = group.entries.map((e) => ({
    x: xScale(e.date.getTime()),
    y: yScale(getYValue(e)),
    entry: e,
  }));

  const pathD = pts.length > 1
    ? pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ")
    : null;
  const areaD = pathD
    ? `${pathD} L${pts[pts.length - 1].x.toFixed(1)} ${DC.pt + dPlotH} L${pts[0].x.toFixed(1)} ${DC.pt + dPlotH} Z`
    : null;

  const lineColor = "#2563eb";

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const screenXPx = e.clientX - rect.left;
    const svgX = screenXPx * (DC.w / rect.width);
    const tAtMouse = ((svgX - DC.pl) / dPlotW) * (maxTime - minTime) + minTime;

    const entryIdx = group.entries.reduce((bestI, e, i) =>
      Math.abs(e.date.getTime() - tAtMouse) < Math.abs(group.entries[bestI].date.getTime() - tAtMouse)
        ? i : bestI
    , 0);

    const entry = group.entries[entryIdx];
    const prevEntry = entryIdx > 0 ? group.entries[entryIdx - 1] : null;

    setTooltip({
      screenXPx,
      svgWidthPx: rect.width,
      entry,
      entryIdx,
      changeFromFirst: group.entries[0].unitPrice > 0
        ? ((entry.unitPrice - group.entries[0].unitPrice) / group.entries[0].unitPrice) * 100
        : null,
      changeFromPrev: prevEntry && prevEntry.unitPrice > 0
        ? ((entry.unitPrice - prevEntry.unitPrice) / prevEntry.unitPrice) * 100
        : null,
    });
  };

  const crosshairX = tooltip ? xScale(tooltip.entry.date.getTime()) : null;
  const tooltipOnRight = tooltip ? tooltip.screenXPx < tooltip.svgWidthPx * 0.58 : true;

  return (
    <div className="relative rounded-lg border border-[var(--nav-border)] bg-background overflow-hidden">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${DC.w} ${DC.h}`}
        width="100%"
        className="block"
        style={{ cursor: "crosshair" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      >
        {yTicks.map((v, i) => (
          <line key={i} x1={DC.pl} y1={yScale(v)} x2={DC.pl + dPlotW} y2={yScale(v)}
            stroke="currentColor" strokeOpacity={0.07} strokeWidth={1} />
        ))}
        {zeroY !== null && (
          <line x1={DC.pl} y1={zeroY} x2={DC.pl + dPlotW} y2={zeroY}
            stroke="currentColor" strokeOpacity={0.2} strokeWidth={1} strokeDasharray="4 3" />
        )}
        {firstPriceY !== null && (
          <>
            <line x1={DC.pl} y1={firstPriceY} x2={DC.pl + dPlotW} y2={firstPriceY}
              stroke="#94a3b8" strokeOpacity={0.4} strokeWidth={1} strokeDasharray="3 3" />
            <text x={DC.pl - 6} y={firstPriceY} textAnchor="end" dominantBaseline="middle"
              fontSize={9} fill="currentColor" fillOpacity={0.35}>first</text>
          </>
        )}
        {yTicks.map((v, i) => (
          <text key={i} x={DC.pl - 8} y={yScale(v)} textAnchor="end"
            dominantBaseline="middle" fontSize={10} fill="currentColor" fillOpacity={0.45}>
            {metric === "change" ? `${v >= 0 ? "+" : ""}${v.toFixed(0)}%` : fmt(v)}
          </text>
        ))}
        {xTicks.map((d, i) => (
          <text key={i} x={xScale(d.getTime())} y={DC.pt + dPlotH + 16}
            textAnchor="middle" fontSize={10} fill="currentColor" fillOpacity={0.45}>
            {fmtDateShort(d)}
          </text>
        ))}
        <line x1={DC.pl} y1={DC.pt} x2={DC.pl} y2={DC.pt + dPlotH}
          stroke="currentColor" strokeOpacity={0.12} strokeWidth={1} />
        <line x1={DC.pl} y1={DC.pt + dPlotH} x2={DC.pl + dPlotW} y2={DC.pt + dPlotH}
          stroke="currentColor" strokeOpacity={0.12} strokeWidth={1} />
        {areaD && <path d={areaD} fill={lineColor} fillOpacity={0.08} stroke="none" />}
        {pathD && (
          <path d={pathD} fill="none" stroke={lineColor} strokeWidth={2.5}
            strokeLinejoin="round" strokeLinecap="round" />
        )}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4} fill={lineColor} stroke="white" strokeWidth={2} />
        ))}
        {crosshairX !== null && tooltip && (
          <>
            <line x1={crosshairX} y1={DC.pt} x2={crosshairX} y2={DC.pt + dPlotH}
              stroke="currentColor" strokeOpacity={0.25} strokeWidth={1} strokeDasharray="3 2" />
            <circle cx={crosshairX} cy={yScale(getYValue(tooltip.entry))} r={6}
              fill={lineColor} stroke="white" strokeWidth={2.5} />
          </>
        )}
      </svg>
      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 top-2 rounded-lg border border-[var(--nav-border)] bg-background shadow-lg text-xs w-48"
          style={{
            ...(tooltipOnRight
              ? { left: `calc(${(tooltip.screenXPx / tooltip.svgWidthPx) * 100}% + 12px)` }
              : { right: `calc(${((tooltip.svgWidthPx - tooltip.screenXPx) / tooltip.svgWidthPx) * 100}% + 12px)` }
            ),
          }}
        >
          <div className="border-b border-[var(--nav-border)] px-3 py-2">
            <p className="font-medium text-foreground">{fmtDate(tooltip.entry.date)}</p>
          </div>
          <div className="px-3 py-2 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Unit price</span>
              <span className="font-mono font-semibold text-foreground">
                {fmt(tooltip.entry.unitPrice)}{tooltip.entry.uom ? ` / ${tooltip.entry.uom}` : ""}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Quantity</span>
              <span className="font-mono text-foreground">{tooltip.entry.quantity}</span>
            </div>
            {tooltip.changeFromPrev !== null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">vs prev</span>
                <span className={changeCls(tooltip.changeFromPrev, true)}>{fmtPct(tooltip.changeFromPrev)}</span>
              </div>
            )}
            {tooltip.changeFromFirst !== null && tooltip.entryIdx > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">vs first</span>
                <span className={changeCls(tooltip.changeFromFirst)}>{fmtPct(tooltip.changeFromFirst)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Item detail ───────────────────────────────────────────────────────────────

export function ItemDetail({ group, onBack }: { group: ItemGroup; onBack: () => void }) {
  const [metric, setMetric] = useState<Metric>("price");

  const last = group.entries[group.entries.length - 1];
  const first = group.entries[0];
  const change = overallChangePct(group);
  const minPrice = Math.min(...group.entries.map((e) => e.unitPrice));
  const maxPrice = Math.max(...group.entries.map((e) => e.unitPrice));
  const avgPrice = group.entries.reduce((s, e) => s + e.unitPrice, 0) / group.entries.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>←</span>
          <span>Back</span>
        </button>
        <span className="text-muted-foreground/40">/</span>
        <h2 className="text-sm font-semibold text-foreground">{group.name}</h2>
        {group.uom && <span className="text-xs text-muted-foreground">({group.uom})</span>}
        {change !== null && (
          <span className={cn(
            "ml-auto rounded-full px-2.5 py-0.5 text-xs font-semibold font-mono",
            change > 0 ? "bg-destructive/10 text-destructive"
            : change < 0 ? "bg-green-600/10 text-green-600 dark:text-green-500"
            : "bg-muted text-muted-foreground"
          )}>
            {fmtPct(change)} overall
          </span>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2">
        {[
          { label: "First capture", value: fmtDate(first.date), mono: false },
          { label: "Last capture", value: fmtDate(last.date), mono: false },
          { label: "Min price", value: fmt(minPrice) + (group.uom ? ` / ${group.uom}` : ""), mono: true },
          { label: "Avg price", value: fmt(avgPrice) + (group.uom ? ` / ${group.uom}` : ""), mono: true },
          { label: "Max price", value: fmt(maxPrice) + (group.uom ? ` / ${group.uom}` : ""), mono: true },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-[var(--nav-border)] bg-background px-3 py-2.5">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={cn("mt-1 text-sm font-medium text-foreground", s.mono && "font-mono")}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-lg border border-[var(--nav-border)] bg-background p-0.5 w-fit">
          <button type="button" onClick={() => setMetric("price")} className={segBtn(metric === "price")}>Unit price</button>
          <button type="button" onClick={() => setMetric("change")} className={segBtn(metric === "change")}>% from first</button>
        </div>
        <span className="text-xs text-muted-foreground">{group.entries.length} capture{group.entries.length !== 1 ? "s" : ""}</span>
      </div>

      {group.entries.length < 2 ? (
        <div className="rounded-lg border border-[var(--nav-border)] bg-muted/20 p-6 text-center text-sm text-muted-foreground">
          Only one capture — no trend to chart yet.
        </div>
      ) : (
        <ItemDetailChart group={group} metric={metric} />
      )}

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Capture history</h3>
        <div className="rounded-lg border border-[var(--nav-border)] overflow-hidden bg-background">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--nav-border)] bg-muted/30">
                <th className="py-2 px-4 text-left font-medium text-foreground">Date</th>
                <th className="py-2 px-4 text-right font-medium text-foreground">Qty</th>
                <th className="py-2 px-4 text-right font-medium text-foreground">UoM</th>
                <th className="py-2 px-4 text-right font-medium text-foreground">Unit price (excl. VAT)</th>
                <th className="py-2 px-4 text-right font-medium text-foreground">vs Previous</th>
                <th className="py-2 px-4 text-right font-medium text-foreground">vs First</th>
              </tr>
            </thead>
            <tbody>
              {group.entries.map((entry, ei) => {
                const prev = ei > 0 ? group.entries[ei - 1] : null;
                const pct = prev && prev.unitPrice > 0
                  ? ((entry.unitPrice - prev.unitPrice) / prev.unitPrice) * 100 : null;
                const pctFirst = ei > 0 && group.entries[0].unitPrice > 0
                  ? ((entry.unitPrice - group.entries[0].unitPrice) / group.entries[0].unitPrice) * 100 : null;
                return (
                  <tr
                    key={`${entry.invoiceId}-${ei}`}
                    className={cn(
                      "border-b border-[var(--nav-border)]/50",
                      ei % 2 === 0 ? "bg-background" : "bg-muted/10"
                    )}
                  >
                    <td className="py-2 px-4 text-foreground">{fmtDate(entry.date)}</td>
                    <td className="py-2 px-4 text-right font-mono">{entry.quantity}</td>
                    <td className="py-2 px-4 text-right text-muted-foreground">{entry.uom ?? "—"}</td>
                    <td className="py-2 px-4 text-right font-mono font-semibold text-foreground">{fmt(entry.unitPrice)}</td>
                    <td className={cn("py-2 px-4 text-right", changeCls(pct))}>
                      {pct === null ? "—" : fmtPct(pct)}
                    </td>
                    <td className={cn("py-2 px-4 text-right", changeCls(pctFirst))}>
                      {pctFirst === null ? "—" : fmtPct(pctFirst)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Category card helpers ─────────────────────────────────────────────────────

export function ItemChangeBar({ name, change, maxAbs }: { name: string; change: number; maxAbs: number }) {
  const widthPct = maxAbs > 0 ? (Math.abs(change) / maxAbs) * 100 : 100;
  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className="w-28 shrink-0 truncate text-xs text-muted-foreground">{name}</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted/30 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", change > 0 ? "bg-destructive/65" : "bg-green-600/60")}
          style={{ width: `${widthPct}%` }}
        />
      </div>
      <span className={cn("w-12 shrink-0 text-right text-xs font-mono font-medium",
        change > 0 ? "text-destructive" : "text-green-600 dark:text-green-500")}>
        {fmtPct(change)}
      </span>
    </div>
  );
}

export function CategoryCard({ type, groups, onSelect }: { type: string; groups: ItemGroup[]; onSelect: () => void }) {
  const changes = groups.map((g) => ({ name: g.name, change: overallChangePct(g) }));
  const withChange = changes.filter((c): c is { name: string; change: number } => c.change !== null);
  const noChange = changes.filter((c) => c.change === null);

  const increased = withChange.filter((c) => c.change > 0).length;
  const decreased = withChange.filter((c) => c.change < 0).length;
  const avgChange = withChange.length > 0
    ? withChange.reduce((s, c) => s + c.change, 0) / withChange.length : null;

  const sorted = [...withChange].sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  const maxAbs = sorted.length > 0 ? Math.max(...sorted.map((c) => Math.abs(c.change))) : 1;
  const shown = sorted.slice(0, 6);
  const hidden = sorted.length - shown.length + noChange.length;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex flex-col gap-3 rounded-lg border border-[var(--nav-border)] bg-background p-4 text-left transition-colors hover:bg-muted/20 hover:border-[var(--nav-active-border)]/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nav-active-border)]/50 w-full"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-sm text-foreground">{typeLabel(type)}</p>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            <span>{groups.length} item{groups.length !== 1 ? "s" : ""}</span>
            {increased > 0 && <span className="text-destructive">{increased} up</span>}
            {decreased > 0 && <span className="text-green-600 dark:text-green-500">{decreased} down</span>}
          </div>
        </div>
        {avgChange !== null && (
          <span className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold font-mono",
            avgChange > 0 ? "bg-destructive/10 text-destructive"
            : avgChange < 0 ? "bg-green-600/10 text-green-600 dark:text-green-500"
            : "bg-muted text-muted-foreground"
          )}>
            avg {fmtPct(avgChange)}
          </span>
        )}
      </div>
      {shown.length > 0 ? (
        <div className="w-full space-y-0.5">
          {shown.map((c) => (
            <ItemChangeBar key={c.name} name={c.name} change={c.change} maxAbs={maxAbs} />
          ))}
          {hidden > 0 && (
            <p className="pt-1 text-xs text-muted-foreground">+{hidden} more</p>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No price change data yet — items have only one capture.</p>
      )}
    </button>
  );
}
