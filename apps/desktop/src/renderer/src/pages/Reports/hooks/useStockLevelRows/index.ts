import { useEffect, useMemo, useState } from 'react';
import { useInventory } from '@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext';
import { stockMovementsService } from '@/services/stockMovements';
import { stockLevelRowsOf } from './utils/stockLevelRowsOf';
import { availableCategoriesOfRows } from './utils/availableCategoriesOfRows';
import { filterRowsByCategories } from './utils/filterRowsByCategories';
import type { StockLevelRow } from './types';

export function useStockLevelRows(entityId: string | undefined, asOfDate: string | undefined) {
  const { items, categories } = useInventory();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<StockLevelRow[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      stockMovementsService.getCurrentStock(entityId, asOfDate),
      stockMovementsService.getWeightedAvgCosts(entityId, asOfDate),
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
  }, [items, categories, entityId, asOfDate]);

  const availableCategories = useMemo(() => availableCategoriesOfRows(rows), [rows]);
  const filteredRows = useMemo(
    () => filterRowsByCategories(rows, selectedCategories),
    [rows, selectedCategories],
  );

  return {
    loading,
    rows: filteredRows,
    availableCategories,
    selectedCategories,
    setSelectedCategories,
  };
}
