import { useState, useCallback, useEffect } from 'react';
import { invoiceService } from '@/services/invoice';
import { stockMovementsService } from '@/services/stockMovements';

export type ItemCostEntry = {
  lastUnitCost: number | null;
  lastCostDate: Date | null;
  weightedAvgCost: number | null;
};

export function useInventoryCosts(): Map<string, ItemCostEntry> {
  const [costMap, setCostMap] = useState<Map<string, ItemCostEntry>>(new Map());

  const loadCosts = useCallback(async () => {
    const [lines, wacRecord] = await Promise.all([
      invoiceService.getLinesForAnalysis(),
      stockMovementsService.getWeightedAvgCosts(),
    ]);
    const map = new Map<string, ItemCostEntry>();
    for (const line of lines) {
      if (line.qty <= 0) continue;
      const date = new Date(line.invoiceDate);
      const existing = map.get(line.inventoryItemId);
      if (!existing || date > (existing.lastCostDate ?? new Date(0))) {
        map.set(line.inventoryItemId, {
          lastUnitCost: line.unitCost,
          lastCostDate: date,
          weightedAvgCost: wacRecord[line.inventoryItemId] ?? null,
        });
      }
    }
    for (const [itemId, wac] of Object.entries(wacRecord)) {
      if (!map.has(itemId)) {
        map.set(itemId, { lastUnitCost: null, lastCostDate: null, weightedAvgCost: wac });
      }
    }
    setCostMap(map);
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadCosts()
      .catch(() => {})
      .finally(() => {
        if (cancelled) return;
      });
    return () => {
      cancelled = true;
    };
  }, [loadCosts]);

  return costMap;
}
