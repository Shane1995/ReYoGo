import { ipcMain } from 'electron';
import type {
  ISaveCapturedInvoicePayload,
  IUpdateCapturedInvoicePayload,
  IUpdateCapturedInvoiceMetadataPayload,
  ISaveCreditNotePayload,
} from '@reyogo/types';
import { InvoicesIPC } from '@shared/types/ipc';
import { getRepos } from '../../db';
import { scheduleDebouncedSync } from '../../db/syncScheduler';

export function registerInvoicesHandlers(): void {
  ipcMain.handle(InvoicesIPC.SAVE_INVOICE, async (_e, payload: ISaveCapturedInvoicePayload) => {
    const result = await getRepos().invoices.saveInvoice(payload);
    scheduleDebouncedSync();
    return result;
  });
  ipcMain.handle(
    InvoicesIPC.SAVE_AND_POST_INVOICE,
    async (_e, payload: ISaveCapturedInvoicePayload) => {
      const result = await getRepos().invoices.saveAndPostInvoice(payload);
      scheduleDebouncedSync();
      return result;
    },
  );
  ipcMain.handle(InvoicesIPC.POST_INVOICE, async (_e, id: string) => {
    const result = await getRepos().invoices.postInvoice(id);
    scheduleDebouncedSync();
    return result;
  });
  ipcMain.handle(InvoicesIPC.GET_INVOICES, () => getRepos().invoices.getInvoices());
  ipcMain.handle(InvoicesIPC.GET_INVOICES_WITH_LINES, () =>
    getRepos().invoices.getInvoicesWithLines(),
  );
  ipcMain.handle(InvoicesIPC.GET_INVOICE, (_e, id: string) =>
    getRepos().invoices.getInvoiceById(id),
  );
  ipcMain.handle(InvoicesIPC.GET_LINES_FOR_ANALYSIS, (_e, entityId?: string) =>
    getRepos().invoices.getLinesForAnalysis(entityId),
  );
  ipcMain.handle(InvoicesIPC.UPDATE_INVOICE, async (_e, payload: IUpdateCapturedInvoicePayload) => {
    const result = await getRepos().invoices.updateInvoice(payload);
    scheduleDebouncedSync();
    return result;
  });
  ipcMain.handle(
    InvoicesIPC.UPDATE_INVOICE_METADATA,
    async (_e, payload: IUpdateCapturedInvoiceMetadataPayload) => {
      const result = await getRepos().invoices.updateInvoiceMetadata(payload);
      scheduleDebouncedSync();
      return result;
    },
  );
  ipcMain.handle(InvoicesIPC.GET_INVOICE_AUDIT, (_e, id: string) =>
    getRepos().invoices.getInvoiceAudit(id),
  );
  ipcMain.handle(InvoicesIPC.GET_LAST_UNIT_PRICES, () => getRepos().invoices.getLastUnitPrices());
  ipcMain.handle(InvoicesIPC.SAVE_CREDIT_NOTE, async (_e, payload: ISaveCreditNotePayload) => {
    const result = await getRepos().invoices.saveCreditNote(payload);
    scheduleDebouncedSync();
    return result;
  });
  ipcMain.handle(InvoicesIPC.GET_CREDIT_NOTES_FOR_INVOICE, (_e, sourceInvoiceId: string) =>
    getRepos().invoices.getCreditNotesForInvoice(sourceInvoiceId),
  );
}
