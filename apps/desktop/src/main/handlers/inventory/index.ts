import { ipcMain } from 'electron';
import type { Category, InventoryItemInput } from '@reyogo/types';
import { InventoryIPC } from '@shared/types/ipc';
import { getRepos } from '../../db';

export function registerInventoryHandlers(): void {
  ipcMain.handle(InventoryIPC.GET_CATEGORIES, () => getRepos().inventory.getCategories());
  ipcMain.handle(InventoryIPC.GET_ITEMS, () => getRepos().inventory.getItems());
  ipcMain.handle(InventoryIPC.UPSERT_CATEGORY, (_e, category: Category) =>
    getRepos().inventory.upsertCategory(category),
  );
  ipcMain.handle(InventoryIPC.UPSERT_ITEM, (_e, item: InventoryItemInput) =>
    getRepos().inventory.upsertItem(item),
  );
  ipcMain.handle(InventoryIPC.DELETE_CATEGORY, (_e, id: string) =>
    getRepos().inventory.deleteCategory(id),
  );
  ipcMain.handle(InventoryIPC.DELETE_ITEM, (_e, id: string) => getRepos().inventory.deleteItem(id));
}
