import { useEffect, useState } from "react";
import { invoiceService } from "@/services/invoice";
import type { IInvoiceLineWithDate } from "@shared/types/contract";

type ItemCost = {
  price: number;
  uom?: string;
  date: Date;
};

export function useItemCosts(): Map<string, ItemCost> {
  const [costMap, setCostMap] = useState<Map<string, ItemCost>>(new Map());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const lines: IInvoiceLineWithDate[] = await invoiceService.getLinesForAnalysis();
        if (cancelled) return;
        const map = new Map<string, ItemCost>();
        for (const line of lines) {
          if (line.quantity <= 0) continue;
          const date = new Date(line.createdAt);
          const existing = map.get(line.itemId);
          if (!existing || date > existing.date) {
            map.set(line.itemId, {
              price: line.totalVatExclude / line.quantity,
              uom: line.unitOfMeasure ?? undefined,
              date,
            });
          }
        }
        setCostMap(map);
      } catch {
        // no invoice data available
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return costMap;
}
