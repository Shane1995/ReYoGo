import type { ItemGroup } from "../types";

export type GroupStats = {
  count: number;
  avgChange: number | null;
  increased: number;
  decreased: number;
};

export function overallChangePct(group: ItemGroup): number | null {
  const first = group.entries[0].unitPrice;
  const last = group.entries[group.entries.length - 1].unitPrice;
  return group.entries.length > 1 && first > 0 ? ((last - first) / first) * 100 : null;
}

export function groupStats(gs: ItemGroup[]): GroupStats {
  const changes = gs.map(overallChangePct).filter((v): v is number => v !== null);
  return {
    count: gs.length,
    avgChange: changes.length > 0 ? changes.reduce((a, b) => a + b, 0) / changes.length : null,
    increased: changes.filter((v) => v > 0).length,
    decreased: changes.filter((v) => v < 0).length,
  };
}
