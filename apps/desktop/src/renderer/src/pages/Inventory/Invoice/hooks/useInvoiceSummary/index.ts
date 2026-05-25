import { useMemo } from 'react';
import type { ProcessReceiptLine } from '../../types';
import { getProcessLineComputed } from '../../types';

type ItemLike = { id: string; name: string; categoryId: string };
type CategoryLike = { id: string; name: string; type: string };

export function useInvoiceSummary(
  lines: ProcessReceiptLine[],
  items: ItemLike[],
  categories: CategoryLike[],
) {
  const itemsWithCategory = useMemo(
    () =>
      items.map((item) => {
        const cat = categories.find((c) => c.id === item.categoryId);
        return { ...item, categoryName: cat?.name ?? '', typeLabel: cat?.type ?? '' };
      }),
    [items, categories],
  );

  const itemMetaMap = useMemo(
    () => new Map(itemsWithCategory.map((i) => [i.id, i])),
    [itemsWithCategory],
  );

  const invoiceSummary = useMemo(
    () =>
      lines.reduce(
        (acc, line) => {
          const c = getProcessLineComputed(line);
          return {
            lineCount: acc.lineCount + (line.itemId ? 1 : 0),
            subtotal: acc.subtotal + c.netTotal,
            totalVat: acc.totalVat + c.vatAmount,
            grandTotal: acc.grandTotal + c.grossTotal,
          };
        },
        { lineCount: 0, subtotal: 0, totalVat: 0, grandTotal: 0 },
      ),
    [lines],
  );

  const validLines = useMemo(
    () => lines.filter((l) => l.itemId && Number(l.quantity) > 0 && (l.totalVatExclude ?? 0) >= 0),
    [lines],
  );

  return { invoiceSummary, validLines, itemsWithCategory, itemMetaMap };
}
