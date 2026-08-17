import { useEffect, useMemo, useState } from 'react';
import { useInventory } from '@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext';
import { stockMovementsService } from '@/services/stockMovements';
import { invoiceService } from '@/services/invoice';
import { stockLevelRowsOf } from './utils/stockLevelRowsOf';
import { availableCategoriesOfRows } from './utils/availableCategoriesOfRows';
import { filterRowsByCategories } from './utils/filterRowsByCategories';
import { availableTypesOfRows } from './utils/availableTypesOfRows';
import { filterRowsByType } from './utils/filterRowsByType';
import { StockCostSource } from './types';
import type { StockLevelRow } from './types';

function costByItemOf(
  costSource: StockCostSource,
  entityId: string | undefined,
  asOfDate: string | undefined,
): Promise<Record<string, number | null>> {
  if (costSource === StockCostSource.LastCost) {
    return invoiceService
      .getLastUnitPrices(asOfDate)
      .then((prices) =>
        Object.fromEntries(Object.entries(prices).map(([itemId, p]) => [itemId, p.exclVat])),
      );
  }
  return stockMovementsService.getWeightedAvgCosts(entityId, asOfDate);
}

export function useStockLevelRows(
  entityId: string | undefined,
  asOfDate: string | undefined,
  selectedCategories: string[],
  selectedType: string,
  costSource: StockCostSource,
) {
  const { items, categories } = useInventory();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<StockLevelRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      stockMovementsService.getCurrentStock(entityId, asOfDate),
      costByItemOf(costSource, entityId, asOfDate),
    ])
      .then(([stockByItem, costByItem]) => {
        if (cancelled) return;
        setRows(stockLevelRowsOf(items, categories, stockByItem, costByItem));
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
  }, [items, categories, entityId, asOfDate, costSource]);

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
