import { ipcMain } from 'electron';
import { CatalogIPC } from '../../../shared/types/ipc';

export const registerItemCatalogHandlers = () => {
  ipcMain.handle(CatalogIPC.GET_ITEMS, () => {
    return [];
  });

  ipcMain.handle(CatalogIPC.ADD_ITEM, (_, item) => {
    console.log(item);
  });

  ipcMain.handle(CatalogIPC.CLEAR_ITEMS, () => {
    console.log('clear-items');
  });
};