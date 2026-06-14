import { TYPE_ORDER } from '../../../../constants';
import type { ItemGroup } from '../../../../types';
import type { Section } from '../../types';

export function buildSections(groups: ItemGroup[]): Section[] {
  const sectionMap = new Map<string, ItemGroup[]>();
  for (const g of groups) {
    const existing = sectionMap.get(g.categoryType);
    if (existing) {
      existing.push(g);
    } else {
      sectionMap.set(g.categoryType, [g]);
    }
  }
  return [
    ...TYPE_ORDER.filter((t) => sectionMap.has(t)).map((t) => ({
      type: t,
      groups: sectionMap.get(t)!,
    })),
    ...Array.from(sectionMap.entries())
      .filter(([t]) => !TYPE_ORDER.includes(t))
      .map(([t, gs]) => ({ type: t, groups: gs })),
  ];
}
