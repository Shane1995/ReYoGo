import { ipcMain } from 'electron';
import { StockMovementsIPC } from '@shared/types/ipc';
import { getRepos } from '../../db';

export function registerStockMovementsHandlers(): void {
  ipcMain.handle(StockMovementsIPC.GET_CURRENT_STOCK, (_e, entityId?: string) =>
    getRepos().stockMovements.getCurrentStockByItem(entityId),
  );
  ipcMain.handle(StockMovementsIPC.GET_WEIGHTED_AVG_COSTS, (_e, entityId?: string) =>
    getRepos().stockMovements.getWeightedAvgCosts(entityId),
  );
  ipcMain.handle(StockMovementsIPC.GET_ITEM_COST_HISTORY, (_e, itemId: string, entityId?: string) =>
    getRepos().stockMovements.getItemCostHistory(itemId, entityId),
  );
  ipcMain.handle(
    StockMovementsIPC.GET_COGS,
    (_e, fromDate?: string, toDate?: string, entityId?: string) =>
      getRepos().stockMovements.getCOGS(fromDate, toDate, entityId),
  );
}
