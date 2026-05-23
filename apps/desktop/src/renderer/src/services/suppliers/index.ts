import { SuppliersIPC } from '@shared/types/ipc';
import type { IUpsertSupplierPayload } from '@reyogo/types';

const invoke = () => window.electronAPI.ipcRenderer.invoke;

export const suppliersService = {
  getSuppliers: () => invoke()(SuppliersIPC.GET_SUPPLIERS),
  upsertSupplier: (payload: IUpsertSupplierPayload) =>
    invoke()(SuppliersIPC.UPSERT_SUPPLIER, payload),
  deleteSupplier: (id: string) => invoke()(SuppliersIPC.DELETE_SUPPLIER, id),
};
