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
