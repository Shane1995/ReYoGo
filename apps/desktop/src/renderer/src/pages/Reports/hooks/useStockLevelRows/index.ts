import { useEffect, useMemo, useState } from 'react';
import { useInventory } from '@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext';
import { stockMovementsService } from '@/services/stockMovements';
import { stockLevelRowsOf } from './utils/stockLevelRowsOf';
import { availableCategoriesOfRows } from './utils/availableCategoriesOfRows';
import { filterRowsByCategories } from './utils/filterRowsByCategories';
import { availableTypesOfRows } from './utils/availableTypesOfRows';
import { filterRowsByType } from './utils/filterRowsByType';
import type { StockLevelRow } from './types';

export function useStockLevelRows(
  entityId: string | undefined,
  asOfDate: string | undefined,
  selectedCategories: string[],
  selectedType: string,
) {
  const { items, categories } = useInventory();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<StockLevelRow[]>([]);

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
  const availableTypes = useMemo(() => availableTypesOfRows(rows), [rows]);
  const filteredRows = useMemo(() => {
    const byCategory = filterRowsByCategories(rows, selectedCategories);
    return filterRowsByType(byCategory, selectedType);
  }, [rows, selectedCategories, selectedType]);

  return {
    loading,
    rows: filteredRows,
    availableCategories,
    availableTypes,
  };
}
