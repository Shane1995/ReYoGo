import type { ProcessReceiptLine, VatMode } from '../../types';

export type DraftState = {
  lines: ProcessReceiptLine[];
  invoiceNumber: string;
  invoiceDate: string;
  vatMode: VatMode;
};
