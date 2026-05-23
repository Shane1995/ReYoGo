export type VatMode = 'inclusive' | 'exclusive' | 'non-taxable';

export interface IInvoiceLine {
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

export interface IInvoice {
  id: string;
  supplierId: string | null;
  invoiceNumber?: string | null;
  invoiceDate?: Date | null;
  createdAt: Date;
  updatedAt?: Date | null;
}

export interface IInvoiceWithLines extends IInvoice {
  lines: IInvoiceLine[];
}

export interface IInvoiceLineWithDate extends IInvoiceLine {
  createdAt: Date;
  categoryType?: string | null;
  categoryName?: string | null;
}

export interface IInvoiceAuditEntry {
  id: string;
  invoiceId: string;
  editedAt: Date;
  note?: string | null;
  snapshot: IInvoiceWithLines;
}

export interface ISaveInvoicePayload {
  id: string;
  supplierId?: string | null;
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

export interface IUpdateInvoicePayload {
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

// Backward-compat aliases — remove once renderer is fully updated in Task 15
export type ICapturedInvoiceLine = IInvoiceLine;
export type ICapturedInvoice = IInvoice;
export type ICapturedInvoiceWithLines = IInvoiceWithLines;
export type ICapturedInvoiceAuditEntry = IInvoiceAuditEntry;
export type ISaveCapturedInvoicePayload = ISaveInvoicePayload;
export type IUpdateCapturedInvoicePayload = IUpdateInvoicePayload;
