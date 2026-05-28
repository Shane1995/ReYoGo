import { InvoicesIPC } from '@shared/types/ipc';
import type {
  ISaveCapturedInvoicePayload,
  IUpdateCapturedInvoicePayload,
  IInvoiceWithLines,
  IInvoiceAuditEntry,
  InvoiceLineWithDate,
} from '@reyogo/types';

const invoke = () => window.electronAPI.ipcRenderer.invoke;

export const invoiceService = {
  saveInvoice: (payload: ISaveCapturedInvoicePayload) =>
    invoke()(InvoicesIPC.SAVE_INVOICE, payload),
  getInvoicesWithLines: (): Promise<IInvoiceWithLines[]> =>
    invoke()(InvoicesIPC.GET_INVOICES_WITH_LINES) as Promise<IInvoiceWithLines[]>,
  getInvoice: (id: string): Promise<IInvoiceWithLines | null> =>
    invoke()(InvoicesIPC.GET_INVOICE, id) as Promise<IInvoiceWithLines | null>,
  getLinesForAnalysis: (): Promise<InvoiceLineWithDate[]> =>
    invoke()(InvoicesIPC.GET_LINES_FOR_ANALYSIS) as Promise<InvoiceLineWithDate[]>,
  updateInvoice: (payload: IUpdateCapturedInvoicePayload) =>
    invoke()(InvoicesIPC.UPDATE_INVOICE, payload),
  getInvoiceAudit: (id: string): Promise<IInvoiceAuditEntry[]> =>
    invoke()(InvoicesIPC.GET_INVOICE_AUDIT, id) as Promise<IInvoiceAuditEntry[]>,
  getLastUnitPrices: () => invoke()(InvoicesIPC.GET_LAST_UNIT_PRICES),
};
