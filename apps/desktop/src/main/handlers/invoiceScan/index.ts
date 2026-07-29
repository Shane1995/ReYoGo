import { ipcMain } from 'electron';
import { InvoiceScanIPC } from '@shared/types/ipc';
import { scanInvoiceImage } from '../../lib/invoiceScanner';

export function registerInvoiceScanHandlers(): void {
  ipcMain.handle(InvoiceScanIPC.SCAN, (_event, payload: { base64: string; mimeType: string }) =>
    scanInvoiceImage(payload),
  );
}
