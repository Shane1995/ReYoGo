import type { ICOGSSummary, IItemCostHistory, IStockMovement } from '@reyogo/types';
import { StockMovementsIPC } from '@shared/types/ipc';

const invoke = () => window.electronAPI.ipcRenderer.invoke;

export const stockMovementsService = {
  getCurrentStock: (): Promise<Record<string, number>> =>
    invoke()(StockMovementsIPC.GET_CURRENT_STOCK) as Promise<Record<string, number>>,

  getWeightedAvgCosts: (): Promise<Record<string, number | null>> =>
    invoke()(StockMovementsIPC.GET_WEIGHTED_AVG_COSTS) as Promise<Record<string, number | null>>,

  getItemCostHistory: (itemId: string): Promise<IItemCostHistory[]> =>
    invoke()(StockMovementsIPC.GET_ITEM_COST_HISTORY, itemId) as Promise<IItemCostHistory[]>,

  getCOGS: (fromDate?: string, toDate?: string): Promise<ICOGSSummary> =>
    invoke()(StockMovementsIPC.GET_COGS, fromDate, toDate) as Promise<ICOGSSummary>,

  getCurrentStockMovements: (): Promise<IStockMovement[]> =>
    invoke()(StockMovementsIPC.GET_CURRENT_STOCK) as Promise<IStockMovement[]>,
};
