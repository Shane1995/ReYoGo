import { InvoicesIPC } from '@shared/types/ipc';
import type {
  ISaveCapturedInvoicePayload,
  IUpdateCapturedInvoicePayload,
  IUpdateCapturedInvoiceMetadataPayload,
} from '@reyogo/types';

const invoke = () => window.electronAPI.ipcRenderer.invoke;

export const invoiceService = {
  saveInvoice: (payload: ISaveCapturedInvoicePayload) =>
    invoke()(InvoicesIPC.SAVE_INVOICE, payload),
  saveAndPostInvoice: (payload: ISaveCapturedInvoicePayload) =>
    invoke()(InvoicesIPC.SAVE_AND_POST_INVOICE, payload),
  getInvoicesWithLines: () => invoke()(InvoicesIPC.GET_INVOICES_WITH_LINES),
  getInvoice: (id: string) => invoke()(InvoicesIPC.GET_INVOICE, id),
  getLinesForAnalysis: () => invoke()(InvoicesIPC.GET_LINES_FOR_ANALYSIS),
  postInvoice: (id: string) => invoke()(InvoicesIPC.POST_INVOICE, id),
  updateInvoice: (payload: IUpdateCapturedInvoicePayload) =>
    invoke()(InvoicesIPC.UPDATE_INVOICE, payload),
  updateInvoiceMetadata: (payload: IUpdateCapturedInvoiceMetadataPayload) =>
    invoke()(InvoicesIPC.UPDATE_INVOICE_METADATA, payload),
  getInvoiceAudit: (id: string) => invoke()(InvoicesIPC.GET_INVOICE_AUDIT, id),
  getLastUnitPrices: () => invoke()(InvoicesIPC.GET_LAST_UNIT_PRICES),
};
