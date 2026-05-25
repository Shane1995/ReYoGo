import { ipcMain } from 'electron';
import type { UpsertSupplierPayload } from '@reyogo/types';
import { SuppliersIPC } from '@shared/types/ipc';
import { getRepos } from '../../db';

export function registerSuppliersHandlers(): void {
  ipcMain.handle(SuppliersIPC.GET_SUPPLIERS, () => getRepos().suppliers.getSuppliers());
  ipcMain.handle(SuppliersIPC.UPSERT_SUPPLIER, (_e, payload: UpsertSupplierPayload) =>
    getRepos().suppliers.upsertSupplier(payload),
  );
  ipcMain.handle(SuppliersIPC.DELETE_SUPPLIER, (_e, id: string) =>
    getRepos().suppliers.deleteSupplier(id),
  );
}
