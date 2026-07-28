import { TYPE_ORDER } from '@/pages/Inventory/Analysis/constants';
import type { StockLevelRow } from '../../types';

export function availableTypesOfRows(rows: StockLevelRow[]): string[] {
  const seen = new Set(rows.map((row) => row.categoryType));
  return TYPE_ORDER.filter((t) => seen.has(t)).concat(
    Array.from(seen).filter((t) => !TYPE_ORDER.includes(t)),
  );
}
