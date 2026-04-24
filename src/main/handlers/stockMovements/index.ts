import { ipcMain } from 'electron';
import { StockMovementsIPC } from '../../../shared/types/ipc';
import * as stockMovementsDb from '../../dataAccess/stockMovements';

async function getCurrentStock(): Promise<Awaited<ReturnType<typeof stockMovementsDb.getCurrentStockByItem>>> {
  return stockMovementsDb.getCurrentStockByItem();
}

export function registerStockMovementsHandlers(): void {
  ipcMain.handle(StockMovementsIPC.GET_CURRENT_STOCK, getCurrentStock);
}
