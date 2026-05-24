import { ipcMain } from 'electron';
import type { ISaveInvoicePayload, IUpdateInvoicePayload } from '@reyogo/types';
import { InvoicesIPC } from '@shared/types/ipc';
import { getRepos } from '../../db';

export function registerInvoicesHandlers(): void {
  ipcMain.handle(InvoicesIPC.SAVE_INVOICE, (_e, payload: ISaveInvoicePayload) =>
    getRepos().invoices.saveInvoice(payload),
  );
  ipcMain.handle(InvoicesIPC.GET_INVOICES, () => getRepos().invoices.getInvoices());
  ipcMain.handle(InvoicesIPC.GET_INVOICES_WITH_LINES, () =>
    getRepos().invoices.getInvoicesWithLines(),
  );
  ipcMain.handle(InvoicesIPC.GET_INVOICE, (_e, id: string) =>
    getRepos().invoices.getInvoiceById(id),
  );
  ipcMain.handle(InvoicesIPC.GET_LINES_FOR_ANALYSIS, () =>
    getRepos().invoices.getLinesForAnalysis(),
  );
  ipcMain.handle(InvoicesIPC.UPDATE_INVOICE, (_e, payload: IUpdateInvoicePayload) =>
    getRepos().invoices.updateInvoice(payload),
  );
  ipcMain.handle(InvoicesIPC.GET_INVOICE_AUDIT, (_e, id: string) =>
    getRepos().invoices.getInvoiceAudit(id),
  );
  ipcMain.handle(InvoicesIPC.GET_LAST_UNIT_PRICES, () => getRepos().invoices.getLastUnitPrices());
}
