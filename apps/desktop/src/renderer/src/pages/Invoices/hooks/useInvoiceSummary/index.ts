import { useMemo } from 'react';
import type { ProcessReceiptLine, VatMode } from '../../types';
import { getProcessLineComputed } from '../../types';
import type { ItemLike, CategoryLike } from './types';

function categoryOf(categories: CategoryLike[], categoryId: string): CategoryLike | undefined {
  return categories.find((c) => c.id === categoryId);
}

function enrichedItemOf(
  item: ItemLike,
  categories: CategoryLike[],
  lastUnitCosts: Record<string, number>,
) {
  const cat = categoryOf(categories, item.categoryId);
  return {
    ...item,
    categoryName: cat ? cat.name : '',
    typeLabel: cat ? cat.type : '',
    lastUnitCostInclVat: lastUnitCosts[item.id],
  };
}

export function useInvoiceSummary(
  lines: ProcessReceiptLine[],
  items: ItemLike[],
  categories: CategoryLike[],
  vatMode: VatMode,
  vatRate: number,
  lastUnitCosts: Record<string, number> = {},
) {
  const itemsWithCategory = useMemo(
    () => items.map((item) => enrichedItemOf(item, categories, lastUnitCosts)),
    [items, categories, lastUnitCosts],
  );

  const itemMetaMap = useMemo(
    () => new Map(itemsWithCategory.map((i) => [i.id, i])),
    [itemsWithCategory],
  );

  const invoiceSummary = useMemo(
    () =>
      lines.reduce(
        (acc, line) => {
          const c = getProcessLineComputed(line, vatMode, vatRate);
          return {
            lineCount: acc.lineCount + (line.itemId ? 1 : 0),
            subtotal: acc.subtotal + c.netTotal,
            totalVat: acc.totalVat + c.vatAmount,
            grandTotal: acc.grandTotal + c.grossTotal,
          };
        },
        { lineCount: 0, subtotal: 0, totalVat: 0, grandTotal: 0 },
      ),
    [lines, vatMode, vatRate],
  );

  const validLines = useMemo(
    () => lines.filter((l) => l.itemId && Number(l.quantity) > 0 && (l.totalVatExclude ?? 0) >= 0),
    [lines],
  );

  return { invoiceSummary, validLines, itemsWithCategory, itemMetaMap };
}
