import type { VatMode } from '../invoices';

export type ScanConfidence = 'high' | 'medium' | 'low';

export interface IScannedInvoiceLine {
  description: string;
  quantity: number;
  unitPrice: number;
  isVatable: boolean | null;
  quantityConfidence: ScanConfidence;
  unitPriceConfidence: ScanConfidence;
}

export interface IScannedInvoice {
  supplierName: string | null;
  supplierNameConfidence: ScanConfidence;
  invoiceDate: string | null;
  invoiceDateConfidence: ScanConfidence;
  invoiceNumber: string | null;
  invoiceNumberConfidence: ScanConfidence;
  vatMode: VatMode | null;
  invoiceTotal: number | null;
  lines: IScannedInvoiceLine[];
  confidence: ScanConfidence;
}

export interface IInvoiceScanUsage {
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
}

export interface IInvoiceScanResult {
  invoice: IScannedInvoice;
  usage: IInvoiceScanUsage;
}
