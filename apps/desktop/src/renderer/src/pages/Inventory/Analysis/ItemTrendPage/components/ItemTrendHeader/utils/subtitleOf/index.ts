import type { ItemGroup } from '../../../../../types';
import type { Stats } from '../../../../types';
import { uomPartOf } from '../uomPartOf';
import { captureCountLabel } from '../captureCountLabel';

export function subtitleOf(group: ItemGroup, stats: Stats | null): string {
  const category = group.categoryName ?? group.categoryType;
  if (!stats) return category;
  return `${category}${uomPartOf(stats)} · ${captureCountLabel(stats)}`;
}
