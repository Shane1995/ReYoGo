import { InvoiceScanIPC } from '@shared/types/ipc';
import type { IInvoiceScanResult } from '@reyogo/types';

const invoke = () => window.electronAPI.ipcRenderer.invoke;

export const invoiceScanService = {
  scan: (payload: { base64: string; mimeType: string }): Promise<IInvoiceScanResult> =>
    invoke()(InvoiceScanIPC.SCAN, payload),
};
