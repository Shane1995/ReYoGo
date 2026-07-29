export const InvoiceScanIPC = {
  SCAN: 'invoice-scan:scan',
} as const;

export type InvoiceScanIPC = (typeof InvoiceScanIPC)[keyof typeof InvoiceScanIPC];
