import type { IInvoiceScanUsage, ScanConfidence, VatMode } from '@reyogo/types';
import type { ItemOption } from '../../components/ItemAutocomplete';
import type { ProcessReceiptLine } from '../../types';
import type { TotalMismatch } from '../../utils/reconcileScannedTotal/types';

export type ScanStatus = 'idle' | 'preview' | 'scanning' | 'error';

export type UseInvoiceScanParams = {
  itemsWithCategory: ItemOption[];
  suppliers: { id: string; name: string }[];
  setInvoiceNumber: (v: string) => void;
  setInvoiceDate: (v: string) => void;
  setSupplierId: (id: string) => void;
  setVatMode: (mode: VatMode) => void;
  setLines: (lines: ProcessReceiptLine[]) => void;
};

export type HeaderReview = {
  supplier: boolean;
  date: boolean;
  invoiceNumber: boolean;
};

export type LastScanSummary = {
  usage: IInvoiceScanUsage;
  reviewNotes: string[];
  totalMismatch: TotalMismatch | null;
  flagCount: number;
  confidence: ScanConfidence;
  scannedAt: Date;
  previewUrl: string | null;
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
};
