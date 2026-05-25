import { InvoicesIPC } from '@shared/types/ipc';
import type {
  IInvoice,
  IInvoiceWithLines,
  IInvoiceLineWithDate,
  IInvoiceAuditEntry,
  ISaveInvoicePayload,
  IUpdateInvoicePayload,
} from '@reyogo/types';

const invoke = () => window.electronAPI.ipcRenderer.invoke;

export const invoiceService = {
  saveInvoice: (payload: ISaveInvoicePayload) =>
    invoke()(InvoicesIPC.SAVE_INVOICE, payload as never),
  getInvoices: (): Promise<IInvoice[]> =>
    invoke()(InvoicesIPC.GET_INVOICES) as unknown as Promise<IInvoice[]>,
  getInvoicesWithLines: (): Promise<IInvoiceWithLines[]> =>
    invoke()(InvoicesIPC.GET_INVOICES_WITH_LINES) as unknown as Promise<IInvoiceWithLines[]>,
  getInvoice: (id: string): Promise<IInvoiceWithLines | null> =>
    invoke()(InvoicesIPC.GET_INVOICE, id) as unknown as Promise<IInvoiceWithLines | null>,
  getLinesForAnalysis: (): Promise<IInvoiceLineWithDate[]> =>
    invoke()(InvoicesIPC.GET_LINES_FOR_ANALYSIS) as unknown as Promise<IInvoiceLineWithDate[]>,
  updateInvoice: (payload: IUpdateInvoicePayload) =>
    invoke()(InvoicesIPC.UPDATE_INVOICE, payload as never),
  getInvoiceAudit: (id: string): Promise<IInvoiceAuditEntry[]> =>
    invoke()(InvoicesIPC.GET_INVOICE_AUDIT, id) as unknown as Promise<IInvoiceAuditEntry[]>,
  getLastUnitPrices: () => invoke()(InvoicesIPC.GET_LAST_UNIT_PRICES),
};
