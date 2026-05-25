import { InvoicesIPC } from '@shared/types/ipc';
import type {
  Invoice,
  InvoiceWithLines,
  InvoiceLineWithDate,
  InvoiceAuditEntry,
  SaveInvoicePayload,
  UpdateInvoicePayload,
} from '@reyogo/types';

const invoke = () => window.electronAPI.ipcRenderer.invoke;

export const invoiceService = {
  saveInvoice: (payload: SaveInvoicePayload) =>
    invoke()(InvoicesIPC.SAVE_INVOICE, payload as never),
  getInvoices: (): Promise<Invoice[]> => invoke()(InvoicesIPC.GET_INVOICES) as Promise<Invoice[]>,
  getInvoicesWithLines: (): Promise<InvoiceWithLines[]> =>
    invoke()(InvoicesIPC.GET_INVOICES_WITH_LINES) as Promise<InvoiceWithLines[]>,
  getInvoice: (id: string): Promise<InvoiceWithLines | null> =>
    invoke()(InvoicesIPC.GET_INVOICE, id) as Promise<InvoiceWithLines | null>,
  getLinesForAnalysis: (): Promise<InvoiceLineWithDate[]> =>
    invoke()(InvoicesIPC.GET_LINES_FOR_ANALYSIS) as Promise<InvoiceLineWithDate[]>,
  updateInvoice: (payload: UpdateInvoicePayload) =>
    invoke()(InvoicesIPC.UPDATE_INVOICE, payload as never),
  getInvoiceAudit: (id: string): Promise<InvoiceAuditEntry[]> =>
    invoke()(InvoicesIPC.GET_INVOICE_AUDIT, id) as Promise<InvoiceAuditEntry[]>,
  getLastUnitPrices: () => invoke()(InvoicesIPC.GET_LAST_UNIT_PRICES),
};
