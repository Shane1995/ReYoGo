import { ipcMain } from 'electron';
import type { Category, InventoryItem, InventorySubmitPayload } from '@reyogo/types';
import { InventoryIPC } from '@shared/types/ipc';
import { ACCOUNT_ID, getRepos, resolveCurrentIds } from '../../db';
import { scheduleDebouncedSync } from '../../db/syncScheduler';

export function registerInventoryHandlers(): void {
  ipcMain.handle(InventoryIPC.GET_CATEGORIES, () => getRepos().inventory.getCategories());
  ipcMain.handle(InventoryIPC.GET_ITEMS, () => getRepos().inventory.getItems());
  ipcMain.handle(InventoryIPC.UPSERT_CATEGORY, async (_e, category: Category) => {
    const result = await getRepos().inventory.upsertCategory(category, ACCOUNT_ID);
    scheduleDebouncedSync();
    return result;
  });
  ipcMain.handle(InventoryIPC.UPSERT_ITEM, async (_e, item: InventoryItem) => {
    const entityId = item.entityId ?? (await resolveCurrentIds()).entityId;
    const result = await getRepos().inventory.upsertItem(item, entityId);
    scheduleDebouncedSync();
    return result;
  });
  ipcMain.handle(InventoryIPC.DELETE_CATEGORY, async (_e, id: string) => {
    const result = await getRepos().inventory.deleteCategory(id);
    scheduleDebouncedSync();
    return result;
  });
  ipcMain.handle(InventoryIPC.DELETE_ITEM, async (_e, id: string) => {
    const result = await getRepos().inventory.deleteItem(id);
    scheduleDebouncedSync();
    return result;
  });
  ipcMain.handle(InventoryIPC.SUBMIT, async (_e, payload: InventorySubmitPayload) => {
    const { entityId } = await resolveCurrentIds();
    const result = await getRepos().inventory.submitInventory(payload, ACCOUNT_ID, entityId);
    scheduleDebouncedSync();
    return result;
  });
  ipcMain.handle(InventoryIPC.ARCHIVE_ITEM, async (_e, id: string) => {
    const result = await getRepos().inventory.archiveItem(id);
    scheduleDebouncedSync();
    return result;
  });
  ipcMain.handle(InventoryIPC.RESTORE_ITEM, async (_e, id: string) => {
    const result = await getRepos().inventory.restoreItem(id);
    scheduleDebouncedSync();
    return result;
  });
  ipcMain.handle(InventoryIPC.HARD_DELETE_ITEM, async (_e, id: string) => {
    const result = await getRepos().inventory.hardDeleteItem(id);
    scheduleDebouncedSync();
    return result;
  });
  ipcMain.handle(InventoryIPC.GET_ITEM_USAGE_COUNT, (_e, id: string) =>
    getRepos().inventory.getItemUsageCount(id),
  );
  ipcMain.handle(InventoryIPC.GET_ARCHIVED_ITEMS, () => getRepos().inventory.getArchivedItems());
  ipcMain.handle(InventoryIPC.ARCHIVE_CATEGORY, async (_e, id: string) => {
    const result = await getRepos().inventory.archiveCategory(id);
    scheduleDebouncedSync();
    return result;
  });
  ipcMain.handle(InventoryIPC.RESTORE_CATEGORY, async (_e, id: string) => {
    const result = await getRepos().inventory.restoreCategory(id);
    scheduleDebouncedSync();
    return result;
  });
  ipcMain.handle(InventoryIPC.HARD_DELETE_CATEGORY, async (_e, id: string) => {
    const result = await getRepos().inventory.hardDeleteCategory(id);
    scheduleDebouncedSync();
    return result;
  });
  ipcMain.handle(InventoryIPC.GET_CATEGORY_USAGE_COUNT, (_e, id: string) =>
    getRepos().inventory.getCategoryUsageCount(id),
  );
  ipcMain.handle(InventoryIPC.GET_ARCHIVED_CATEGORIES, () =>
    getRepos().inventory.getArchivedCategories(),
  );
}
