import { ipcMain } from 'electron';
import type {
  ISaveCapturedInvoicePayload,
  IUpdateCapturedInvoicePayload,
  IUpdateCapturedInvoiceMetadataPayload,
  IUpdatePostedInvoiceLinesPayload,
  ISaveCreditNotePayload,
} from '@reyogo/types';
import { InvoicesIPC } from '@shared/types/ipc';
import { getRepos } from '../../db';
import { withSync } from '../../db/syncScheduler';

export function registerInvoicesHandlers(): void {
  ipcMain.handle(InvoicesIPC.SAVE_INVOICE, (_e, payload: ISaveCapturedInvoicePayload) =>
    withSync(() => getRepos().invoices.saveInvoice(payload)),
  );
  ipcMain.handle(InvoicesIPC.SAVE_AND_POST_INVOICE, (_e, payload: ISaveCapturedInvoicePayload) =>
    withSync(() => getRepos().invoices.saveAndPostInvoice(payload)),
  );
  ipcMain.handle(InvoicesIPC.POST_INVOICE, (_e, id: string) =>
    withSync(() => getRepos().invoices.postInvoice(id)),
  );
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
  ipcMain.handle(InvoicesIPC.UPDATE_INVOICE, (_e, payload: IUpdateCapturedInvoicePayload) =>
    withSync(() => getRepos().invoices.updateInvoice(payload)),
  );
  ipcMain.handle(
    InvoicesIPC.UPDATE_INVOICE_METADATA,
    (_e, payload: IUpdateCapturedInvoiceMetadataPayload) =>
      withSync(() => getRepos().invoices.updateInvoiceMetadata(payload)),
  );
  ipcMain.handle(InvoicesIPC.GET_INVOICE_AUDIT, (_e, id: string) =>
    getRepos().invoices.getInvoiceAudit(id),
  );
  ipcMain.handle(InvoicesIPC.GET_LAST_UNIT_PRICES, (_e, asOfDate?: string) =>
    getRepos().invoices.getLastUnitPrices(asOfDate),
  );
  ipcMain.handle(InvoicesIPC.SAVE_CREDIT_NOTE, (_e, payload: ISaveCreditNotePayload) =>
    withSync(() => getRepos().invoices.saveCreditNote(payload)),
  );
  ipcMain.handle(InvoicesIPC.GET_CREDIT_NOTES_FOR_INVOICE, (_e, sourceInvoiceId: string) =>
    getRepos().invoices.getCreditNotesForInvoice(sourceInvoiceId),
  );
  ipcMain.handle(InvoicesIPC.GET_CREDITED_QTY_BY_INVOICE_ITEM, (_e, entityId?: string) =>
    getRepos().invoices.getCreditNotedQtyByInvoiceItem(entityId),
  );
  ipcMain.handle(
    InvoicesIPC.GET_PURCHASE_TOTALS_BY_ITEM,
    (_e, fromDate?: string, toDate?: string, entityId?: string) =>
      getRepos().invoices.getPurchaseTotalsByItem(fromDate, toDate, entityId),
  );
  ipcMain.handle(
    InvoicesIPC.GET_CREDIT_TOTALS_BY_ITEM,
    (_e, fromDate?: string, toDate?: string, entityId?: string) =>
      getRepos().invoices.getCreditTotalsByItem(fromDate, toDate, entityId),
  );
  ipcMain.handle(
    InvoicesIPC.UPDATE_POSTED_INVOICE_LINES,
    (_e, payload: IUpdatePostedInvoiceLinesPayload) =>
      withSync(() => getRepos().invoices.updatePostedInvoiceLines(payload)),
  );
}
