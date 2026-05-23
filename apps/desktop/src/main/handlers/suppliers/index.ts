import { ipcMain } from 'electron';
import type { IUpsertSupplierPayload } from '@reyogo/types';
import { SuppliersIPC } from '@shared/types/ipc';
import * as suppliersDb from '../../dataAccess/suppliers';

export function registerSuppliersHandlers(): void {
  ipcMain.handle(SuppliersIPC.GET_SUPPLIERS, () => suppliersDb.getSuppliers());
  ipcMain.handle(SuppliersIPC.UPSERT_SUPPLIER, (_e, payload: IUpsertSupplierPayload) =>
    suppliersDb.upsertSupplier(payload),
  );
  ipcMain.handle(SuppliersIPC.DELETE_SUPPLIER, (_e, id: string) =>
    suppliersDb.deleteSupplier(id),
  );
}
