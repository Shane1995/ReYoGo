import type { ItemCostHistoryRow } from '../../../../types';

export type ItemCostHistoryRowGroup = {
  itemId: string;
  itemName: string;
  uom?: string;
  flagged: boolean;
  rows: ItemCostHistoryRow[];
};

function ensureGroup(
  groups: ItemCostHistoryRowGroup[],
  byId: Map<string, ItemCostHistoryRowGroup>,
  row: ItemCostHistoryRow,
): ItemCostHistoryRowGroup {
  const existing = byId.get(row.itemId);
  if (existing) return existing;
  const group: ItemCostHistoryRowGroup = {
    itemId: row.itemId,
    itemName: row.itemName,
    uom: row.uom,
    flagged: false,
    rows: [],
  };
  byId.set(row.itemId, group);
  groups.push(group);
  return group;
}

export function groupRowsByItem(rows: ItemCostHistoryRow[]): ItemCostHistoryRowGroup[] {
  const groups: ItemCostHistoryRowGroup[] = [];
  const byId = new Map<string, ItemCostHistoryRowGroup>();
  for (const row of rows) {
    const group = ensureGroup(groups, byId, row);
    group.rows.push(row);
    if (row.flagged) group.flagged = true;
  }
  return groups;
}
