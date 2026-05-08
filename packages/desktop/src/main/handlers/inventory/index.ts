import { ipcMain } from 'electron';
import type { IInventoryCategory, IInventoryItem, IInventorySubmitPayload } from '@shared/types/contract';
import { InventoryIPC } from '../../../shared/types/ipc';
import * as inventoryDb from '../../dataAccess/inventory';

async function getCategories(): Promise<IInventoryCategory[]> {
  return inventoryDb.getCategories();
}

async function getItems(): Promise<IInventoryItem[]> {
  return inventoryDb.getItems();
}

async function upsertCategory(
  _event: Electron.IpcMainInvokeEvent,
  category: IInventoryCategory
): Promise<void> {
  await inventoryDb.upsertCategory(category);
}

async function upsertItem(
  _event: Electron.IpcMainInvokeEvent,
  item: IInventoryItem
): Promise<void> {
  await inventoryDb.upsertItem(item);
}

async function deleteCategory(
  _event: Electron.IpcMainInvokeEvent,
  id: string
): Promise<void> {
  await inventoryDb.deleteCategory(id);
}

async function deleteItem(_event: Electron.IpcMainInvokeEvent, id: string): Promise<void> {
  await inventoryDb.deleteItem(id);
}

async function submit(
  _event: Electron.IpcMainInvokeEvent,
  payload: IInventorySubmitPayload
): Promise<void> {
  for (const c of payload.addedCategories) await inventoryDb.upsertCategory(c);
  for (const c of payload.updatedCategories) await inventoryDb.upsertCategory(c);
  for (const i of payload.addedItems) await inventoryDb.upsertItem(i);
  for (const i of payload.updatedItems) await inventoryDb.upsertItem(i);
  for (const id of payload.deletedItemIds) await inventoryDb.deleteItem(id);
  for (const id of payload.deletedCategoryIds) await inventoryDb.deleteCategory(id);
}

export function registerInventoryHandlers(): void {
  ipcMain.handle(InventoryIPC.GET_CATEGORIES, getCategories);
  ipcMain.handle(InventoryIPC.GET_ITEMS, getItems);
  ipcMain.handle(InventoryIPC.UPSERT_CATEGORY, upsertCategory);
  ipcMain.handle(InventoryIPC.UPSERT_ITEM, upsertItem);
  ipcMain.handle(InventoryIPC.DELETE_CATEGORY, deleteCategory);
  ipcMain.handle(InventoryIPC.DELETE_ITEM, deleteItem);
  ipcMain.handle(InventoryIPC.SUBMIT, submit);
}
