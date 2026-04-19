import React, { useRef, useState } from "react";
import { fmt, fmtDate, fmtDateShort, fmtPct } from "../utils/format";
import { changeCls } from "../utils/styles";
import type { ItemEntry, ItemGroup, Metric } from "../types";

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
