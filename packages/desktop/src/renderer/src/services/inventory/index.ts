import { InventoryIPC } from '@shared/types/ipc';
import type { IInventoryCategory, IInventoryItem } from '@shared/types/contract/inventory';

const invoke = () => window.electronAPI.ipcRenderer.invoke;

export const inventoryService = {
  getCategories: (): Promise<IInventoryCategory[]> => invoke()(InventoryIPC.GET_CATEGORIES),
  getItems: (): Promise<IInventoryItem[]> => invoke()(InventoryIPC.GET_ITEMS),
  upsertCategory: (category: IInventoryCategory): Promise<void> => invoke()(InventoryIPC.UPSERT_CATEGORY, category),
  upsertItem: (item: IInventoryItem): Promise<void> => invoke()(InventoryIPC.UPSERT_ITEM, item),
  deleteCategory: (id: string): Promise<void> => invoke()(InventoryIPC.DELETE_CATEGORY, id),
  deleteItem: (id: string): Promise<void> => invoke()(InventoryIPC.DELETE_ITEM, id),
};
