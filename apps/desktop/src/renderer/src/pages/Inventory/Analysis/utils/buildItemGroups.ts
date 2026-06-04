import type { InvoiceLineWithDate } from '@reyogo/types';
import type { ItemGroup } from '../types';

type ItemLookup = { id: string; name: string; unitOfMeasure?: string };

export function buildItemGroups(
  lines: InvoiceLineWithDate[],
  fromDate: string,
  toDate: string,
  items: ItemLookup[] = [],
): ItemGroup[] {
  const from = fromDate ? new Date(fromDate + 'T00:00:00') : null;
  const to = toDate ? new Date(toDate + 'T23:59:59') : null;
  const itemById = new Map(items.map((i) => [i.id, i]));

  const map = new Map<string, ItemGroup>();
  for (const line of lines) {
    if (line.qty <= 0) continue;
    const date = new Date(line.invoiceDate);
    if (from && date < from) continue;
    if (to && date > to) continue;

    const item = itemById.get(line.inventoryItemId);
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
    group.entries.push({
      invoiceId: line.invoiceId,
      date,
      quantity: line.qty,
      unitPrice: line.unitCost,
      unitPriceInclVat: line.isVatable ? line.unitCost * (1 + line.vatRate / 100) : line.unitCost,
      uom: item?.unitOfMeasure,
    });
  }

  return Array.from(map.values())
    .filter((g) => g.entries.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
}
