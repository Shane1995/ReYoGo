import type { ScanConfidence } from '@reyogo/types';
import type { SUPPORTED_SCAN_MIME_TYPES } from './constants';

export type SupportedScanMimeType = (typeof SUPPORTED_SCAN_MIME_TYPES)[number];

export interface ScanImageInput {
  base64: string;
  mimeType: string;
}

export interface RawScannedInvoiceLine {
  description: string;
  quantity: number;
  unitPrice: number;
  isVatable: boolean | null;
  quantityConfidence: ScanConfidence;
  unitPriceConfidence: ScanConfidence;
}

export interface RawScannedInvoice {
  supplierName: string | null;
  supplierNameConfidence: ScanConfidence;
  invoiceDate: string | null;
  invoiceDateConfidence: ScanConfidence;
  invoiceNumber: string | null;
  invoiceNumberConfidence: ScanConfidence;
  vatInclusive: boolean;
  invoiceTotal: number | null;
  lines: RawScannedInvoiceLine[];
  confidence: ScanConfidence;
}
