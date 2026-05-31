import { ipcMain } from 'electron';
import type {
  ISaveCapturedInvoicePayload,
  IUpdateCapturedInvoicePayload,
  IUpdateCapturedInvoiceMetadataPayload,
  ISaveCreditNotePayload,
} from '@reyogo/types';
import { InvoicesIPC } from '@shared/types/ipc';
import { getRepos } from '../../db';

export function registerInvoicesHandlers(): void {
  ipcMain.handle(InvoicesIPC.SAVE_INVOICE, (_e, payload: ISaveCapturedInvoicePayload) =>
    getRepos().invoices.saveInvoice(payload),
  );
  ipcMain.handle(InvoicesIPC.SAVE_AND_POST_INVOICE, (_e, payload: ISaveCapturedInvoicePayload) =>
    getRepos().invoices.saveAndPostInvoice(payload),
  );
  ipcMain.handle(InvoicesIPC.POST_INVOICE, (_e, id: string) => getRepos().invoices.postInvoice(id));
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
  ipcMain.handle(InvoicesIPC.UPDATE_INVOICE, (_e, payload: IUpdateCapturedInvoicePayload) =>
    getRepos().invoices.updateInvoice(payload),
  );
  ipcMain.handle(
    InvoicesIPC.UPDATE_INVOICE_METADATA,
    (_e, payload: IUpdateCapturedInvoiceMetadataPayload) =>
      getRepos().invoices.updateInvoiceMetadata(payload),
  );
  ipcMain.handle(InvoicesIPC.GET_INVOICE_AUDIT, (_e, id: string) =>
    getRepos().invoices.getInvoiceAudit(id),
  );
  ipcMain.handle(InvoicesIPC.GET_LAST_UNIT_PRICES, () => getRepos().invoices.getLastUnitPrices());
  ipcMain.handle(InvoicesIPC.SAVE_CREDIT_NOTE, (_e, payload: ISaveCreditNotePayload) =>
    getRepos().invoices.saveCreditNote(payload),
  );
  ipcMain.handle(InvoicesIPC.GET_CREDIT_NOTES_FOR_INVOICE, (_e, sourceInvoiceId: string) =>
    getRepos().invoices.getCreditNotesForInvoice(sourceInvoiceId),
  );
}
