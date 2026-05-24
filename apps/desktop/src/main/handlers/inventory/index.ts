import { ipcMain } from 'electron';
import type { IInventoryCategory, IInventoryItem, IInventorySubmitPayload } from '@reyogo/types';
import { InventoryIPC } from '@shared/types/ipc';
import { getRepos } from '../../db';

export function registerInventoryHandlers(): void {
  ipcMain.handle(InventoryIPC.GET_CATEGORIES, () => getRepos().inventory.getCategories());
  ipcMain.handle(InventoryIPC.GET_ITEMS, () => getRepos().inventory.getItems());
  ipcMain.handle(InventoryIPC.UPSERT_CATEGORY, (_e, category: IInventoryCategory) =>
    getRepos().inventory.upsertCategory(category),
  );
  ipcMain.handle(InventoryIPC.UPSERT_ITEM, (_e, item: IInventoryItem) =>
    getRepos().inventory.upsertItem(item),
  );
  ipcMain.handle(InventoryIPC.DELETE_CATEGORY, (_e, id: string) =>
    getRepos().inventory.deleteCategory(id),
  );
  ipcMain.handle(InventoryIPC.DELETE_ITEM, (_e, id: string) => getRepos().inventory.deleteItem(id));
  ipcMain.handle(InventoryIPC.SUBMIT, async (_e, payload: IInventorySubmitPayload) => {
    const { inventory } = getRepos();
    for (const c of payload.addedCategories) await inventory.upsertCategory(c);
    for (const c of payload.updatedCategories) await inventory.upsertCategory(c);
    for (const i of payload.addedItems) await inventory.upsertItem(i);
    for (const i of payload.updatedItems) await inventory.upsertItem(i);
    for (const id of payload.deletedItemIds) await inventory.deleteItem(id);
    for (const id of payload.deletedCategoryIds) await inventory.deleteCategory(id);
  });
}
