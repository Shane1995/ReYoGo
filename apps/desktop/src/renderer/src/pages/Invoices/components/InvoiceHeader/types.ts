import type { Supplier } from '@reyogo/types';
import type { VatMode } from '@reyogo/types';

export type InvoiceHeaderProps = {
  invoiceNumber: string;
  onInvoiceNumberChange: (v: string) => void;
  invoiceDate: string;
  onInvoiceDateChange: (v: string) => void;
  supplierId: string;
  onSupplierChange: (id: string) => void;
  suppliers: Supplier[];
  vatMode: VatMode;
  onVatModeChange: (mode: VatMode) => void;
  onAddCategory: () => void;
  onAddItem: () => void;
  isDirty: boolean;
  onClear: () => void;
};
