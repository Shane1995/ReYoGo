import { SuppliersIPC } from '@shared/types/ipc';
import type { IUpsertSupplierPayload } from '@reyogo/types';

const invoke = () => window.electronAPI.ipcRenderer.invoke;

export const suppliersService = {
  getSuppliers: (entityId: string) => invoke()(SuppliersIPC.GET_SUPPLIERS, entityId),
  upsertSupplier: (payload: IUpsertSupplierPayload) =>
    invoke()(SuppliersIPC.UPSERT_SUPPLIER, payload),
  deleteSupplier: (id: string) => invoke()(SuppliersIPC.DELETE_SUPPLIER, id),
};
