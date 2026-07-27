import type { ItemGroup } from '@/pages/Inventory/Analysis/types';
import { pctChangeOf } from '@/pages/Inventory/Analysis/utils/pctChangeOf';
import { PRICE_CHANGE_ALERT_THRESHOLD_PERCENT } from '../../../../constants';
import type { ItemCostHistoryRow } from '../../types';

function isFlagged(pctChange: number | null): boolean {
  if (pctChange === null) return false;
  return Math.abs(pctChange) > PRICE_CHANGE_ALERT_THRESHOLD_PERCENT;
}

function rowsForGroup(group: ItemGroup): ItemCostHistoryRow[] {
  return group.entries.map((entry, i) => {
    const prev = i > 0 ? group.entries[i - 1] : undefined;
    const pctChange = pctChangeOf(entry.unitPrice, prev ? prev.unitPrice : null);
    return {
      itemId: group.itemId,
      itemName: group.name,
      uom: group.uom,
      invoiceId: entry.invoiceId,
      date: entry.date,
      quantity: entry.quantity,
      unitCostExclVat: entry.unitPrice,
      unitCostInclVat: entry.unitPriceInclVat,
      isVatable: entry.isVatable,
      pctChange,
      flagged: isFlagged(pctChange),
    };
  });
}

export function itemCostHistoryRowsOf(groups: ItemGroup[]): ItemCostHistoryRow[] {
  return groups.flatMap(rowsForGroup);
}
