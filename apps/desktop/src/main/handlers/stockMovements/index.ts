import { ipcMain } from 'electron';
import { StockMovementsIPC } from '@shared/types/ipc';
import { getRepos } from '../../db';

export function registerStockMovementsHandlers(): void {
  ipcMain.handle(StockMovementsIPC.GET_CURRENT_STOCK, () =>
    getRepos().stockMovements.getCurrentStockByItem(),
  );
  ipcMain.handle(StockMovementsIPC.GET_WEIGHTED_AVG_COSTS, () =>
    getRepos().stockMovements.getWeightedAvgCosts(),
  );
  ipcMain.handle(StockMovementsIPC.GET_ITEM_COST_HISTORY, (_e, itemId: string) =>
    getRepos().stockMovements.getItemCostHistory(itemId),
  );
  ipcMain.handle(StockMovementsIPC.GET_COGS, (_e, fromDate?: string, toDate?: string) =>
    getRepos().stockMovements.getCOGS(fromDate, toDate),
  );
}
