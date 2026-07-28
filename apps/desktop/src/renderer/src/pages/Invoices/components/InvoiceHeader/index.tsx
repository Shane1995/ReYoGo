import { PageHeader } from '@reyogo/ui';
import { HeaderActions } from './components/HeaderActions';
import { InvoiceNumberField } from './components/InvoiceNumberField';
import { DateField } from './components/DateField';
import { SupplierField } from './components/SupplierField';
import { VatModeField } from './components/VatModeField';
import { NO_HEADER_REVIEW } from '../../hooks/useInvoiceScan/constants';
import type { InvoiceHeaderProps } from './types';

export function InvoiceHeader({
  invoiceNumber,
  onInvoiceNumberChange,
  invoiceDate,
  onInvoiceDateChange,
  supplierId,
  onSupplierChange,
  suppliers,
  vatMode,
  onVatModeChange,
  onAddCategory,
  onAddItem,
  isDirty,
  onClear,
  scanConfigured,
  onScanInvoice,
  headerReview = NO_HEADER_REVIEW,
}: InvoiceHeaderProps) {
  return (
    <PageHeader
      title="Capture Invoice"
      actions={
        <HeaderActions
          isDirty={isDirty}
          onClear={onClear}
          scanConfigured={scanConfigured}
          onScanInvoice={onScanInvoice}
          onAddCategory={onAddCategory}
          onAddItem={onAddItem}
        />
      }
    >
      <div className="flex flex-wrap items-end gap-x-5 gap-y-3 pb-1">
        <InvoiceNumberField
          value={invoiceNumber}
          onChange={onInvoiceNumberChange}
          needsReview={headerReview.invoiceNumber}
        />

        <DateField
          value={invoiceDate}
          onChange={onInvoiceDateChange}
          needsReview={headerReview.date}
        />

        <SupplierField
          value={supplierId}
          onChange={onSupplierChange}
          suppliers={suppliers}
          needsReview={headerReview.supplier}
        />

        <div className="h-8 w-px bg-border/60 self-end mb-0.5 hidden sm:block" />

        <VatModeField value={vatMode} onChange={onVatModeChange} />
      </div>
    </PageHeader>
  );
}
