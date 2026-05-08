import { ipcMain } from 'electron';
import { StockMovementsIPC } from '../../../shared/types/ipc';
import * as stockMovementsDb from '../../dataAccess/stockMovements';

async function getCurrentStock(): Promise<Awaited<ReturnType<typeof stockMovementsDb.getCurrentStockByItem>>> {
  return stockMovementsDb.getCurrentStockByItem();
}

async function getWeightedAvgCosts(): Promise<Awaited<ReturnType<typeof stockMovementsDb.getWeightedAvgCosts>>> {
  return stockMovementsDb.getWeightedAvgCosts();
}

async function getItemCostHistory(
  _event: Electron.IpcMainInvokeEvent,
  itemId: string
): Promise<Awaited<ReturnType<typeof stockMovementsDb.getItemCostHistory>>> {
  return stockMovementsDb.getItemCostHistory(itemId);
}

async function getCOGS(
  _event: Electron.IpcMainInvokeEvent,
  fromDate?: string,
  toDate?: string
): Promise<Awaited<ReturnType<typeof stockMovementsDb.getCOGS>>> {
  return stockMovementsDb.getCOGS(fromDate, toDate);
}

export function registerStockMovementsHandlers(): void {
  ipcMain.handle(StockMovementsIPC.GET_CURRENT_STOCK, getCurrentStock);
  ipcMain.handle(StockMovementsIPC.GET_WEIGHTED_AVG_COSTS, getWeightedAvgCosts);
  ipcMain.handle(StockMovementsIPC.GET_ITEM_COST_HISTORY, getItemCostHistory);
  ipcMain.handle(StockMovementsIPC.GET_COGS, getCOGS);
}
