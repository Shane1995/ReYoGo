import { useEffect, useState } from "react";
import { stockMovementsService } from "@/services/stockMovements";

export function useItemStock(): Map<string, number> {
  const [stockMap, setStockMap] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    let cancelled = false;
    stockMovementsService.getCurrentStock()
      .then((record) => {
        if (cancelled) return;
        setStockMap(new Map(Object.entries(record)));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return stockMap;
}
