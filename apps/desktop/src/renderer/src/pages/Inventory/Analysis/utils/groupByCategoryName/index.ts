import type { ItemGroup } from '../../types';

export function groupByCategoryName(groups: ItemGroup[]): [string, ItemGroup[]][] {
  const catMap = new Map<string, ItemGroup[]>();
  for (const g of groups) {
    const key = g.categoryName ?? '';
    const existing = catMap.get(key);
    if (existing) {
      existing.push(g);
    } else {
      catMap.set(key, [g]);
    }
  }
  return Array.from(catMap.entries()).sort(([a], [b]) => a.localeCompare(b));
}
