import type { IInvoiceLineWithDate } from "@shared/types/contract";
import type { ItemGroup } from "../types";

export function buildItemGroups(
  lines: IInvoiceLineWithDate[],
  fromDate: string,
  toDate: string
): ItemGroup[] {
  const from = fromDate ? new Date(fromDate + "T00:00:00") : null;
  const to = toDate ? new Date(toDate + "T23:59:59") : null;

  const map = new Map<string, ItemGroup>();
  for (const line of lines) {
    if (line.quantity <= 0) continue;
    const date = new Date(line.createdAt);
    if (from && date < from) continue;
    if (to && date > to) continue;

    if (!map.has(line.itemId)) {
      map.set(line.itemId, {
        itemId: line.itemId,
        name: line.itemNameSnapshot,
        categoryType: line.categoryType ?? "other",
        categoryName: line.categoryName ?? undefined,
        entries: [],
      });
    }
    const group = map.get(line.itemId)!;
    group.name = line.itemNameSnapshot;
    group.uom = line.unitOfMeasure ?? undefined;
    group.categoryType = line.categoryType ?? group.categoryType;
    group.categoryName = line.categoryName ?? group.categoryName;
    group.entries.push({
      invoiceId: line.invoiceId,
      date,
      quantity: line.quantity,
      unitPrice: line.totalVatExclude / line.quantity,
      uom: line.unitOfMeasure ?? undefined,
    });
  }

  return Array.from(map.values())
    .filter((g) => g.entries.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
}
