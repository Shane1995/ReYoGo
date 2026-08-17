import { TYPE_ORDER } from '@/pages/Inventory/Analysis/constants';
import type { ItemTotalRow } from '../itemTotalRowsOf/types';

export function availableTypesOfItemTotals(rows: ItemTotalRow[]): string[] {
  const seen = new Set(rows.map((row) => row.categoryType));
  return TYPE_ORDER.filter((t) => seen.has(t)).concat(
    Array.from(seen).filter((t) => !TYPE_ORDER.includes(t)),
  );
}
