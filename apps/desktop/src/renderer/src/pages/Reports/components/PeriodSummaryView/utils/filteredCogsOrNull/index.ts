import type { COGSSummary } from '@reyogo/types';
import { filteredCogsOf } from '../filteredCogsOf';

export function filteredCogsOrNull(
  cogs: COGSSummary | null,
  selectedCategories: string[],
): COGSSummary | null {
  if (!cogs) return null;
  return filteredCogsOf(cogs, selectedCategories);
}
