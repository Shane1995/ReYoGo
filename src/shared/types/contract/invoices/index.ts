export type VatMode = 'inclusive' | 'exclusive' | 'non-taxable';

/** Single line as stored (and returned) for a captured invoice. */
export interface ICapturedInvoiceLine {
  id: string;
  invoiceId: string;
  itemId: string;
  itemNameSnapshot: string;
  unitOfMeasure?: string | null;
  quantity: number;
  vatMode: VatMode;
  vatRate: number;
  totalVatExclude: number;
}

/** Captured invoice header (goods received receipt). */
export interface ICapturedInvoice {
  id: string;
  createdAt: Date;
}

/** Invoice with its lines for detail/history view. */
export interface ICapturedInvoiceWithLines extends ICapturedInvoice {
  lines: ICapturedInvoiceLine[];
}

/** Payload to save a new captured invoice (header id + lines). */
export interface ISaveCapturedInvoicePayload {
  id: string;
  lines: Array<{
    id: string;
    itemId: string;
    itemNameSnapshot: string;
    unitOfMeasure?: string | null;
    quantity: number;
    vatMode: VatMode;
    vatRate: number;
    totalVatExclude: number;
  }>;
}
