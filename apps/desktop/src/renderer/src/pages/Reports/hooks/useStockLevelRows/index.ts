import { useEffect, useState } from 'react';
import { useInventory } from '@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext';
import { stockMovementsService } from '@/services/stockMovements';
import { stockLevelRowsOf } from './utils/stockLevelRowsOf';
import type { StockLevelRow } from './types';

export function useStockLevelRows(entityId: string | undefined) {
  const { items, categories } = useInventory();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<StockLevelRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      stockMovementsService.getCurrentStock(entityId),
      stockMovementsService.getWeightedAvgCosts(entityId),
    ])
      .then(([stockByItem, avgCostByItem]) => {
        if (cancelled) return;
        setRows(stockLevelRowsOf(items, categories, stockByItem, avgCostByItem));
      })
      .catch(() => {
        if (!cancelled) setRows([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [items, categories, entityId]);

  return { loading, rows };
}
