import type { InvoiceLineWithDate } from '@reyogo/types';
import type { ItemGroup, ItemEntry } from '../types';

type ItemLookup = { id: string; name: string; unitOfMeasure?: string };

function buildDateWindow(fromDate: string, toDate: string): { from: Date | null; to: Date | null } {
  return {
    from: fromDate ? new Date(fromDate + 'T00:00:00') : null,
    to: toDate ? new Date(toDate + 'T23:59:59') : null,
  };
}

function isInWindow(date: Date, from: Date | null, to: Date | null): boolean {
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

function buildEntry(line: InvoiceLineWithDate, item: ItemLookup | undefined): ItemEntry {
  const date = new Date(line.invoiceDate);
  return {
    invoiceId: line.invoiceId,
    date,
    quantity: line.qty,
    unitPrice: line.unitCost,
    unitPriceInclVat:
      line.unitCostInclVat ??
      (line.isVatable ? line.unitCost * (1 + line.vatRate / 100) : line.unitCost),
    uom: item?.unitOfMeasure,
  };
}

function upsertGroup(
  map: Map<string, ItemGroup>,
  line: InvoiceLineWithDate,
  item: ItemLookup | undefined,
  entry: ItemEntry,
): void {
  if (!map.has(line.inventoryItemId)) {
    map.set(line.inventoryItemId, {
      itemId: line.inventoryItemId,
      name: item?.name ?? line.inventoryItemId,
      categoryType: line.categoryType ?? 'other',
      categoryName: line.categoryName ?? undefined,
      entries: [],
    });
  }
  const group = map.get(line.inventoryItemId)!;
  group.name = item?.name ?? group.name;
  group.uom = item?.unitOfMeasure ?? group.uom;
  group.categoryType = line.categoryType ?? group.categoryType;
  group.categoryName = line.categoryName ?? group.categoryName;
  group.entries.push(entry);
}

export function buildItemGroups(
  lines: InvoiceLineWithDate[],
  fromDate: string,
  toDate: string,
  items: ItemLookup[] = [],
): ItemGroup[] {
  const { from, to } = buildDateWindow(fromDate, toDate);
  const itemById = new Map(items.map((i) => [i.id, i]));
  const map = new Map<string, ItemGroup>();

  for (const line of lines) {
    if (line.qty <= 0) continue;
    const date = new Date(line.invoiceDate);
    if (!isInWindow(date, from, to)) continue;
    const item = itemById.get(line.inventoryItemId);
    upsertGroup(map, line, item, buildEntry(line, item));
  }

  return Array.from(map.values())
    .filter((g) => g.entries.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
}
