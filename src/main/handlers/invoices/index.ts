import { ipcMain } from 'electron';
import type { ISaveCapturedInvoicePayload } from '@shared/types/contract';
import { InvoicesIPC } from '../../../shared/types/ipc';
import * as invoicesDb from '../../dataAccess/invoices';

async function saveInvoice(
  _event: Electron.IpcMainInvokeEvent,
  payload: ISaveCapturedInvoicePayload
): Promise<void> {
  await invoicesDb.saveInvoice(payload);
}

async function getInvoices(): Promise<Awaited<ReturnType<typeof invoicesDb.getInvoices>>> {
  return invoicesDb.getInvoices();
}

async function getInvoice(
  _event: Electron.IpcMainInvokeEvent,
  id: string
): Promise<Awaited<ReturnType<typeof invoicesDb.getInvoiceById>>> {
  return invoicesDb.getInvoiceById(id);
}

export function registerInvoicesHandlers(): void {
  ipcMain.handle(InvoicesIPC.SAVE_INVOICE, saveInvoice);
  ipcMain.handle(InvoicesIPC.GET_INVOICES, getInvoices);
  ipcMain.handle(InvoicesIPC.GET_INVOICE, getInvoice);
}
