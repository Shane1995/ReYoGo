import { useEffect, useState } from 'react';
import type { InvoiceLineWithDate } from '@reyogo/types';
import { invoiceService } from '@/services/invoice';

export function useAnalysisLines(entityId?: string) {
  const [lines, setLines] = useState<InvoiceLineWithDate[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const data = await invoiceService.getLinesForAnalysis(entityId);
        if (!cancelled) setLines(Array.isArray(data) ? data : []);
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
