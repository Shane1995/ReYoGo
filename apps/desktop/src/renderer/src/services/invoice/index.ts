import { InvoicesIPC } from '@shared/types/ipc';
import type { ISaveInvoicePayload, IUpdateInvoicePayload } from '@reyogo/types';

const invoke = () => window.electronAPI.ipcRenderer.invoke;

export const invoiceService = {
  saveInvoice: (payload: ISaveInvoicePayload) => invoke()(InvoicesIPC.SAVE_INVOICE, payload),
  getInvoices: () => invoke()(InvoicesIPC.GET_INVOICES),
  getInvoicesWithLines: () => invoke()(InvoicesIPC.GET_INVOICES_WITH_LINES),
  getInvoice: (id: string) => invoke()(InvoicesIPC.GET_INVOICE, id),
  getLinesForAnalysis: () => invoke()(InvoicesIPC.GET_LINES_FOR_ANALYSIS),
  updateInvoice: (payload: IUpdateInvoicePayload) =>
    invoke()(InvoicesIPC.UPDATE_INVOICE, payload),
  getInvoiceAudit: (id: string) => invoke()(InvoicesIPC.GET_INVOICE_AUDIT, id),
  getLastUnitPrices: () => invoke()(InvoicesIPC.GET_LAST_UNIT_PRICES),
};
