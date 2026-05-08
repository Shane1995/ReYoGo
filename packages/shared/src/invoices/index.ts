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
  invoiceNumber?: string | null;
  invoiceDate?: Date | null;
  createdAt: Date;
  updatedAt?: Date | null;
}

/** Invoice with its lines for detail/history view. */
export interface ICapturedInvoiceWithLines extends ICapturedInvoice {
  lines: ICapturedInvoiceLine[];
}

/** Invoice line joined with its invoice date — used for analysis queries. */
export interface IInvoiceLineWithDate {
  id: string;
  invoiceId: string;
  itemId: string;
  itemNameSnapshot: string;
  unitOfMeasure?: string | null;
  quantity: number;
  vatMode: VatMode;
  vatRate: number;
  totalVatExclude: number;
  createdAt: Date;
  categoryType?: string | null;
  categoryName?: string | null;
}

/** Audit log entry for a single edit to a captured invoice. */
export interface ICapturedInvoiceAuditEntry {
  id: string;
  invoiceId: string;
  editedAt: Date;
  note?: string | null;
  snapshot: ICapturedInvoiceWithLines;
}

/** Payload to update (edit) an existing captured invoice. */
export interface IUpdateCapturedInvoicePayload {
  id: string;
  note?: string;
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

/** Payload to save a new captured invoice (header id + lines). */
export interface ISaveCapturedInvoicePayload {
  id: string;
  invoiceNumber?: string | null;
  invoiceDate?: Date | null;
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
