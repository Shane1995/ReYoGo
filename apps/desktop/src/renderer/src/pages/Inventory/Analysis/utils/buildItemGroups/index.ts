import type { InvoiceLineWithDate } from '@reyogo/types';
import type { ItemGroup, ItemEntry } from '../../types';

type ItemLookup = { id: string; name: string; unitOfMeasure?: string };

function buildDateWindow(fromDate: string, toDate: string): { from: Date | null; to: Date | null } {
  return {
    from: fromDate ? new Date(fromDate + 'T00:00:00') : null,
    to: toDate ? new Date(toDate + 'T23:59:59') : null,
  };
}

function isBeforeWindow(date: Date, from: Date | null): boolean {
  if (!from) return false;
  return date < from;
}

function isAfterWindow(date: Date, to: Date | null): boolean {
  if (!to) return false;
  return date > to;
}

function isInWindow(date: Date, from: Date | null, to: Date | null): boolean {
  if (isBeforeWindow(date, from)) return false;
  if (isAfterWindow(date, to)) return false;
  return true;
}

function buildEntry(
  line: InvoiceLineWithDate,
  item: ItemLookup | undefined,
  date: Date,
): ItemEntry {
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

function categoryNameOf(categoryName: string | null): string | undefined {
  if (categoryName === null) return undefined;
  return categoryName;
}

function createGroup(line: InvoiceLineWithDate, item: ItemLookup | undefined): ItemGroup {
  return {
    itemId: line.inventoryItemId,
    name: item ? item.name : line.inventoryItemId,
    categoryType: line.categoryType !== null ? line.categoryType : 'other',
    categoryName: categoryNameOf(line.categoryName),
    entries: [],
  };
}

function resolveItemFields(
  item: ItemLookup | undefined,
  fallback: { name: string; uom?: string },
): { name: string; uom?: string } {
  return item ? { name: item.name, uom: item.unitOfMeasure } : fallback;
}

function mergeGroupFields(
  group: ItemGroup,
  line: InvoiceLineWithDate,
  item: ItemLookup | undefined,
): ItemGroup {
  const { name, uom } = resolveItemFields(item, { name: group.name, uom: group.uom });
  return {
    ...group,
    name,
    uom,
    categoryType: line.categoryType !== null ? line.categoryType : group.categoryType,
    categoryName: line.categoryName !== null ? line.categoryName : group.categoryName,
  };
}

function upsertGroup(
  map: Map<string, ItemGroup>,
  line: InvoiceLineWithDate,
  item: ItemLookup | undefined,
  entry: ItemEntry,
): void {
  const existing = map.get(line.inventoryItemId) ?? createGroup(line, item);
  const merged = mergeGroupFields(existing, line, item);
  map.set(line.inventoryItemId, { ...merged, entries: [...merged.entries, entry] });
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
    upsertGroup(map, line, item, buildEntry(line, item, date));
  }

  return Array.from(map.values())
    .filter((g) => g.entries.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
}
