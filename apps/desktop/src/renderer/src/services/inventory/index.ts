import { InventoryIPC } from '@shared/types/ipc';
import type { Category, InventoryItem } from '@reyogo/types';

const invoke = () => window.electronAPI.ipcRenderer.invoke;

export const inventoryService = {
  getCategories: (): Promise<Category[]> => invoke()(InventoryIPC.GET_CATEGORIES),
  getItems: () => invoke()(InventoryIPC.GET_ITEMS),
  upsertCategory: (category: Category): Promise<void> =>
    invoke()(InventoryIPC.UPSERT_CATEGORY, category),
  upsertItem: (item: InventoryItem): Promise<void> => invoke()(InventoryIPC.UPSERT_ITEM, item),
  deleteCategory: (id: string): Promise<void> => invoke()(InventoryIPC.DELETE_CATEGORY, id),
  deleteItem: (id: string): Promise<void> => invoke()(InventoryIPC.DELETE_ITEM, id),
};
