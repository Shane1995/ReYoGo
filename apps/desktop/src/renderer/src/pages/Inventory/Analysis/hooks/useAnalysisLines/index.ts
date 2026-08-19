import { useEffect, useState } from 'react';
import type { InvoiceLineWithDate } from '@reyogo/types';
import { invoiceService } from '@/services/invoice';
import { isFullyCredited } from '@/utils/creditedQty';

function withoutFullyCreditedLines(
  lines: InvoiceLineWithDate[],
  creditedQtyByInvoiceItem: Record<string, number>,
): InvoiceLineWithDate[] {
  return lines.filter((line) => {
    const credited = creditedQtyByInvoiceItem[`${line.invoiceId}::${line.inventoryItemId}`] ?? 0;
    return !isFullyCredited(line.qty, credited);
  });
}

export function useAnalysisLines(entityId?: string) {
  const [lines, setLines] = useState<InvoiceLineWithDate[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const [data, creditedQtyByInvoiceItem] = await Promise.all([
          invoiceService.getLinesForAnalysis(entityId),
          invoiceService.getCreditedQtyByInvoiceItem(entityId),
        ]);
        if (!cancelled) {
          setLines(
            withoutFullyCreditedLines(Array.isArray(data) ? data : [], creditedQtyByInvoiceItem),
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [entityId]);
  return { lines, loading };
}
