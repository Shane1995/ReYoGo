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
  ipcMain.handle(InventoryIPC.ARCHIVE_ITEM, (_e, id: string) =>
    getRepos().inventory.archiveItem(id),
  );
  ipcMain.handle(InventoryIPC.RESTORE_ITEM, (_e, id: string) =>
    getRepos().inventory.restoreItem(id),
  );
  ipcMain.handle(InventoryIPC.HARD_DELETE_ITEM, (_e, id: string) =>
    getRepos().inventory.hardDeleteItem(id),
  );
  ipcMain.handle(InventoryIPC.GET_ITEM_USAGE_COUNT, (_e, id: string) =>
    getRepos().inventory.getItemUsageCount(id),
  );
  ipcMain.handle(InventoryIPC.GET_ARCHIVED_ITEMS, () => getRepos().inventory.getArchivedItems());
  ipcMain.handle(InventoryIPC.ARCHIVE_CATEGORY, (_e, id: string) =>
    getRepos().inventory.archiveCategory(id),
  );
  ipcMain.handle(InventoryIPC.RESTORE_CATEGORY, (_e, id: string) =>
    getRepos().inventory.restoreCategory(id),
  );
  ipcMain.handle(InventoryIPC.HARD_DELETE_CATEGORY, (_e, id: string) =>
    getRepos().inventory.hardDeleteCategory(id),
  );
  ipcMain.handle(InventoryIPC.GET_CATEGORY_USAGE_COUNT, (_e, id: string) =>
    getRepos().inventory.getCategoryUsageCount(id),
  );
  ipcMain.handle(InventoryIPC.GET_ARCHIVED_CATEGORIES, () =>
    getRepos().inventory.getArchivedCategories(),
  );
}
