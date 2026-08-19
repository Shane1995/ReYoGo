import { useMemo, useState } from 'react';
import { useInventory } from '@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext';
import { stockMovementsService } from '@/services/stockMovements';
import { invoiceService } from '@/services/invoice';
import { stocktakeService } from '@/services/stocktake';
import { useCancellableFetch } from '../useCancellableFetch';
import { stockLevelRowsOf } from './utils/stockLevelRowsOf';
import { availableCategoriesOfRows } from './utils/availableCategoriesOfRows';
import { filterRowsByCategories } from './utils/filterRowsByCategories';
import { availableTypesOfRows } from './utils/availableTypesOfRows';
import { filterRowsByType } from './utils/filterRowsByType';
import { StockCostSource } from './types';
import type { StockLevelRow } from './types';

function countedQtyByItemOf(lines: { inventoryItemId: string; countedQty: number }[]) {
  const result: Record<string, number> = {};
  for (const line of lines) {
    result[line.inventoryItemId] = (result[line.inventoryItemId] ?? 0) + line.countedQty;
  }
  return result;
}

function stockByItemOf(
  entityId: string | undefined,
  asOfDate: string | undefined,
  sessionId: string | undefined,
): Promise<Record<string, number>> {
  if (!sessionId) return stockMovementsService.getCurrentStock(entityId, asOfDate);
  return stocktakeService
    .getSession(sessionId)
    .then((session) => countedQtyByItemOf(session?.lines ?? []));
}

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
  sessionId?: string,
) {
  const { items, categories } = useInventory();
  const [rows, setRows] = useState<StockLevelRow[]>([]);

  const loading = useCancellableFetch(
    () =>
      Promise.all([
        stockByItemOf(entityId, asOfDate, sessionId),
        costByItemOf(costSource, entityId, asOfDate),
      ]),
    ([stockByItem, costByItem]) =>
      setRows(stockLevelRowsOf(items, categories, stockByItem, costByItem)),
    () => setRows([]),
    [items, categories, entityId, asOfDate, costSource, sessionId],
  );

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
