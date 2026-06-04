export enum InvoiceStatus {
  Draft = 'DRAFT',
  Posted = 'POSTED',
  CreditNote = 'CREDIT_NOTE',
}

export enum VatMode {
  Inclusive = 'inclusive',
  Exclusive = 'exclusive',
}

export interface Invoice {
  id: string;
  supplierId: string | null;
  invoiceNumber: string | null;
  invoiceDate: Date | null;
  status: InvoiceStatus;
  totalExclTax: number;
  taxAmount: number;
  totalInclTax: number;
}

export interface InvoiceLine {
  id: string;
  invoiceId: string;
  inventoryItemId: string;
  qty: number;
  unitCost: number;
  totalCost: number;
}

export interface InvoiceWithLines extends Invoice {
  lines: InvoiceLine[];
}

export type InvoiceLinePayload = Omit<InvoiceLine, 'invoiceId'>;

export interface InvoiceLineWithDate extends InvoiceLine {
  invoiceDate: Date;
  categoryType: string | null;
  categoryName: string | null;
  vatRate: number;
  isVatable: boolean;
  unitCostInclVat: number | null;
}

export interface InvoiceAuditEntry {
  id: string;
  invoiceId: string;
  editedAt: Date;
  note: string | null;
  snapshot: InvoiceWithLines;
}

export interface SaveInvoicePayload extends Invoice {
  lines: InvoiceLinePayload[];
}

export interface UpdateInvoicePayload {
  id: string;
  note?: string;
  lines: InvoiceLinePayload[];
}

export interface IInvoiceLine {
  id: string;
  invoiceId: string;
  itemId: string;
  itemNameSnapshot: string;
  unitOfMeasure?: string | null;
  quantity: number;
  isVatable: boolean;
  totalVatExclude: number;
}

export interface IInvoice {
  id: string;
  entityId: string;
  supplierId: string | null;
  sourceInvoiceId: string | null;
  invoiceNumber: string;
  invoiceDate?: Date | null;
  status: InvoiceStatus;
  vatMode: VatMode;
  vatRate: number;
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

export interface IInvoiceLinePayload {
  id: string;
  itemId: string;
  itemNameSnapshot: string;
  unitOfMeasure?: string | null;
  quantity: number;
  unitPrice: number;
  isVatable: boolean;
  totalVatExclude: number;
}

export interface ISaveInvoicePayload {
  id: string;
  entityId: string;
  supplierId?: string | null;
  invoiceNumber: string;
  invoiceDate?: Date | null;
  vatMode: VatMode;
  vatRate: number;
  lines: IInvoiceLinePayload[];
}

export interface IUpdateInvoicePayload {
  id: string;
  note?: string;
  vatMode?: VatMode;
  vatRate?: number;
  lines: IInvoiceLinePayload[];
}

export interface IUpdateInvoiceMetadataPayload {
  id: string;
  supplierId?: string | null;
  invoiceNumber?: string;
  invoiceDate?: Date | null;
  note?: string;
}

export type ICapturedInvoiceLine = IInvoiceLine;
export type ICapturedInvoice = IInvoice;
export type ICapturedInvoiceWithLines = IInvoiceWithLines;
export type ICapturedInvoiceAuditEntry = IInvoiceAuditEntry;
export type ISaveCapturedInvoicePayload = ISaveInvoicePayload;
export type IUpdateCapturedInvoicePayload = IUpdateInvoicePayload;
export type IUpdateCapturedInvoiceMetadataPayload = IUpdateInvoiceMetadataPayload;

export interface ISaveCreditNotePayload {
  id: string;
  sourceInvoiceId: string;
  entityId: string;
  supplierId?: string | null;
  invoiceNumber: string;
  vatMode: VatMode;
  vatRate: number;
  note?: string;
  lines: IInvoiceLinePayload[];
}
