import { ipcMain } from 'electron';
import type { ISaveCapturedInvoicePayload, IUpdateCapturedInvoicePayload } from '@shared/types/contract';
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

async function getInvoicesWithLines(): Promise<Awaited<ReturnType<typeof invoicesDb.getInvoicesWithLines>>> {
  return invoicesDb.getInvoicesWithLines();
}

async function getInvoice(
  _event: Electron.IpcMainInvokeEvent,
  id: string
): Promise<Awaited<ReturnType<typeof invoicesDb.getInvoiceById>>> {
  return invoicesDb.getInvoiceById(id);
}

async function getLinesForAnalysis(): Promise<Awaited<ReturnType<typeof invoicesDb.getLinesForAnalysis>>> {
  return invoicesDb.getLinesForAnalysis();
}

async function updateInvoice(
  _event: Electron.IpcMainInvokeEvent,
  payload: IUpdateCapturedInvoicePayload
): Promise<void> {
  await invoicesDb.updateInvoice(payload);
}

async function getInvoiceAudit(
  _event: Electron.IpcMainInvokeEvent,
  id: string
): Promise<Awaited<ReturnType<typeof invoicesDb.getInvoiceAudit>>> {
  return invoicesDb.getInvoiceAudit(id);
}

export function registerInvoicesHandlers(): void {
  ipcMain.handle(InvoicesIPC.SAVE_INVOICE, saveInvoice);
  ipcMain.handle(InvoicesIPC.GET_INVOICES, getInvoices);
  ipcMain.handle(InvoicesIPC.GET_INVOICES_WITH_LINES, getInvoicesWithLines);
  ipcMain.handle(InvoicesIPC.GET_INVOICE, getInvoice);
  ipcMain.handle(InvoicesIPC.GET_LINES_FOR_ANALYSIS, getLinesForAnalysis);
  ipcMain.handle(InvoicesIPC.UPDATE_INVOICE, updateInvoice);
  ipcMain.handle(InvoicesIPC.GET_INVOICE_AUDIT, getInvoiceAudit);
}
