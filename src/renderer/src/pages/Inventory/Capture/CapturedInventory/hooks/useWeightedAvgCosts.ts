import { useEffect, useState } from "react";
import { stockMovementsService } from "@/services/stockMovements";

export function useWeightedAvgCosts(): Map<string, number | null> {
  const [costMap, setCostMap] = useState<Map<string, number | null>>(new Map());

  useEffect(() => {
    let cancelled = false;
    stockMovementsService.getWeightedAvgCosts()
      .then((record) => {
        if (cancelled) return;
        setCostMap(new Map(Object.entries(record)));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return costMap;
}
