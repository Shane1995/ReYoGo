import { StockMovementsIPC } from '@shared/types/ipc';

const invoke = () => window.electronAPI.ipcRenderer.invoke;

export const stockMovementsService = {
  getCurrentStock: () =>
    invoke()(StockMovementsIPC.GET_CURRENT_STOCK),

  getWeightedAvgCosts: () =>
    invoke()(StockMovementsIPC.GET_WEIGHTED_AVG_COSTS),

  getItemCostHistory: (itemId: string) =>
    invoke()(StockMovementsIPC.GET_ITEM_COST_HISTORY, itemId),

  getCOGS: (fromDate?: string, toDate?: string) =>
    invoke()(StockMovementsIPC.GET_COGS, fromDate, toDate),
};
