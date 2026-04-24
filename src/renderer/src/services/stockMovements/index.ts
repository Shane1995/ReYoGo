import { StockMovementsIPC } from '@shared/types/ipc';

const invoke = () => window.electronAPI.ipcRenderer.invoke;

export const stockMovementsService = {
  getCurrentStock: (): Promise<Record<string, number>> =>
    invoke()(StockMovementsIPC.GET_CURRENT_STOCK) as Promise<Record<string, number>>,
};
