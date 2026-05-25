// ── New costing/stock entity interfaces ──────────────────────────────────────

export enum InvoiceStatus {
  Draft = 'DRAFT',
  Posted = 'POSTED',
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

// ── Legacy interfaces ─────────────────────────────────────────────────────────

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

export type IInvoiceLinePayload = Omit<IInvoiceLine, 'invoiceId'>;

export interface ISaveInvoicePayload {
  id: string;
  supplierId?: string | null;
  invoiceNumber?: string | null;
  invoiceDate?: Date | null;
  lines: IInvoiceLinePayload[];
}

export interface IUpdateInvoicePayload {
  id: string;
  note?: string;
  lines: IInvoiceLinePayload[];
}

export type ICapturedInvoiceLine = IInvoiceLine;
export type ICapturedInvoice = IInvoice;
export type ICapturedInvoiceWithLines = IInvoiceWithLines;
export type ICapturedInvoiceAuditEntry = IInvoiceAuditEntry;
export type ISaveCapturedInvoicePayload = ISaveInvoicePayload;
export type IUpdateCapturedInvoicePayload = IUpdateInvoicePayload;
