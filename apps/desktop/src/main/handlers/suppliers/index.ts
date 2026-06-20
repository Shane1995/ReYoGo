import { ipcMain } from 'electron';
import type { UpsertSupplierPayload } from '@reyogo/types';
import { SuppliersIPC } from '@shared/types/ipc';
import { getRepos } from '../../db';
import { scheduleDebouncedSync } from '../../db/syncScheduler';

export function registerSuppliersHandlers(): void {
  ipcMain.handle(SuppliersIPC.GET_SUPPLIERS, (_e, entityId: string) =>
    getRepos().suppliers.getSuppliers(entityId),
  );
  ipcMain.handle(SuppliersIPC.UPSERT_SUPPLIER, async (_e, payload: UpsertSupplierPayload) => {
    const result = await getRepos().suppliers.upsertSupplier(payload, payload.entityId);
    scheduleDebouncedSync();
    return result;
  });
  ipcMain.handle(SuppliersIPC.DELETE_SUPPLIER, async (_e, id: string) => {
    const result = await getRepos().suppliers.deleteSupplier(id);
    scheduleDebouncedSync();
    return result;
  });
}
