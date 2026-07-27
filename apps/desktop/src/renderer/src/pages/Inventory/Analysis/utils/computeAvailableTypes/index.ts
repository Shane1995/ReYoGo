import { TYPE_ORDER } from '../../constants';
import type { ItemGroup } from '../../types';

export function computeAvailableTypes(allGroups: ItemGroup[]): string[] {
  const seen = new Set(allGroups.map((g) => g.categoryType));
  return TYPE_ORDER.filter((t) => seen.has(t)).concat(
    Array.from(seen).filter((t) => !TYPE_ORDER.includes(t)),
  );
}
