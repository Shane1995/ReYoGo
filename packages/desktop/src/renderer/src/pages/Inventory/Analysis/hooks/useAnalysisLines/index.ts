import { useEffect, useState } from "react";
import type { IInvoiceLineWithDate } from "@shared/types/contract";
import { invoiceService } from "@/services/invoice";

export function useAnalysisLines() {
  const [lines, setLines] = useState<IInvoiceLineWithDate[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await invoiceService.getLinesForAnalysis();
        if (!cancelled) setLines(Array.isArray(data) ? data : []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);
  return { lines, loading };
}
