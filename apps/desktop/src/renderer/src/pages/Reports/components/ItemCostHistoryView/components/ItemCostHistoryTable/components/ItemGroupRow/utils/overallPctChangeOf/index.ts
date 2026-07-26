import { pctChangeOf } from '@/pages/Inventory/Analysis/utils/pctChangeOf';
import type { ItemCostHistoryRow } from '../../../../../../types';

export function overallPctChangeOf(rows: ItemCostHistoryRow[]): number | null {
  if (rows.length < 2) return null;
  const first = rows[0]!;
  const last = rows[rows.length - 1]!;
  return pctChangeOf(last.unitCostExclVat, first.unitCostExclVat);
}
