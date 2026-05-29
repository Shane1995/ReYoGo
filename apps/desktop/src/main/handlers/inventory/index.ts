import { ipcMain } from 'electron';
import type { Category, InventoryItem, InventorySubmitPayload } from '@reyogo/types';
import { InventoryIPC } from '@shared/types/ipc';
import { getRepos } from '../../db';

export function registerInventoryHandlers(): void {
  ipcMain.handle(InventoryIPC.GET_CATEGORIES, () => getRepos().inventory.getCategories());
  ipcMain.handle(InventoryIPC.GET_ITEMS, () => getRepos().inventory.getItems());
  ipcMain.handle(InventoryIPC.UPSERT_CATEGORY, (_e, category: Category) =>
    getRepos().inventory.upsertCategory(category),
  );
  ipcMain.handle(InventoryIPC.UPSERT_ITEM, (_e, item: InventoryItem) =>
    getRepos().inventory.upsertItem(item),
  );
  ipcMain.handle(InventoryIPC.DELETE_CATEGORY, (_e, id: string) =>
    getRepos().inventory.deleteCategory(id),
  );
  ipcMain.handle(InventoryIPC.DELETE_ITEM, (_e, id: string) => getRepos().inventory.deleteItem(id));
  ipcMain.handle(InventoryIPC.SUBMIT, (_e, payload: InventorySubmitPayload) =>
    getRepos().inventory.submitInventory(payload),
  );
  ipcMain.handle('inventory:archive-item', (_e, id: string) =>
    getRepos().inventory.archiveItem(id),
  );
  ipcMain.handle('inventory:restore-item', (_e, id: string) =>
    getRepos().inventory.restoreItem(id),
  );
  ipcMain.handle('inventory:hard-delete-item', (_e, id: string) =>
    getRepos().inventory.hardDeleteItem(id),
  );
  ipcMain.handle('inventory:get-item-usage-count', (_e, id: string) =>
    getRepos().inventory.getItemUsageCount(id),
  );
  ipcMain.handle('inventory:get-archived-items', () => getRepos().inventory.getArchivedItems());
  ipcMain.handle('inventory:archive-category', (_e, id: string) =>
    getRepos().inventory.archiveCategory(id),
  );
  ipcMain.handle('inventory:restore-category', (_e, id: string) =>
    getRepos().inventory.restoreCategory(id),
  );
  ipcMain.handle('inventory:hard-delete-category', (_e, id: string) =>
    getRepos().inventory.hardDeleteCategory(id),
  );
  ipcMain.handle('inventory:get-category-usage-count', (_e, id: string) =>
    getRepos().inventory.getCategoryUsageCount(id),
  );
  ipcMain.handle('inventory:get-archived-categories', () =>
    getRepos().inventory.getArchivedCategories(),
  );
}
