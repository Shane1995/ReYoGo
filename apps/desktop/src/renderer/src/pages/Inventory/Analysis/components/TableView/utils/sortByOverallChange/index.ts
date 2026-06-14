import type { ItemGroup } from '../../../../types';
import { overallChangePct } from '../../../../utils/stats';
import { compareNullableAsc } from '../compareNullableAsc';

export function sortByOverallChange(a: ItemGroup, b: ItemGroup): number {
  return compareNullableAsc(overallChangePct(a), overallChangePct(b));
}
