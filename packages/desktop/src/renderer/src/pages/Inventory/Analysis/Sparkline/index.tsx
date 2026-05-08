import { overallChangePct } from "../utils/stats";
import type { ItemEntry } from "../types";

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
