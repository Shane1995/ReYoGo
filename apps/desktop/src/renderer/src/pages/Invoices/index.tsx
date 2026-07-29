import { useMemo, useState } from 'react';
import { useInvoiceForm } from './hooks/useInvoiceForm';
import { useSuppliers } from './hooks/useSuppliers';
import { useInvoiceScan } from './hooks/useInvoiceScan';
import { InvoiceHeader } from './components/InvoiceHeader';
import { ReuseNotice } from './components/ReuseNotice';
import { InvoiceBody } from './components/InvoiceBody';
import { InvoiceSummaryFooter } from './components/InvoiceSummaryFooter';
import { InvoiceModals } from './components/InvoiceModals';
import { ScanInvoiceModal } from './components/ScanInvoiceModal';
import { ScanSummaryBar } from './components/ScanSummaryBar';

function shouldShowReuseNotice(isReused: boolean, dismissed: boolean): boolean {
  return isReused && !dismissed;
}

export default function InvoicePage() {
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);

  const form = useInvoiceForm();
  const suppliers = useSuppliers(form.entityId);
  const scan = useInvoiceScan({
    itemsWithCategory: form.itemsWithCategory,
    suppliers,
    setInvoiceNumber: form.setInvoiceNumber,
    setInvoiceDate: form.setInvoiceDate,
    setSupplierId: form.setSupplierId,
    setVatMode: form.setVatMode,
    setLines: form.setLines,
  });
  const sortedItems = useMemo(
    () => [...form.itemsWithCategory].sort((a, b) => a.name.localeCompare(b.name)),
    [form.itemsWithCategory],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <InvoiceHeader
        invoiceNumber={form.invoiceNumber}
        onInvoiceNumberChange={scan.handleInvoiceNumberChange}
        invoiceDate={form.invoiceDate}
        onInvoiceDateChange={scan.handleInvoiceDateChange}
        supplierId={form.supplierId}
        onSupplierChange={scan.handleSupplierChange}
        suppliers={suppliers}
        vatMode={form.vatMode}
        onVatModeChange={form.setVatMode}
        onAddCategory={() => setCategoryModalOpen(true)}
        onAddItem={() => setItemModalOpen(true)}
        isDirty={form.isDirty}
        onClear={form.clearForm}
        scanConfigured={scan.configured}
        onScanInvoice={scan.openModal}
        headerReview={scan.headerReview}
      />
      {shouldShowReuseNotice(form.isReused, form.reuseNoticeDismissed) && (
        <ReuseNotice onDismiss={() => form.setReuseNoticeDismissed(true)} />
      )}
      {scan.lastSummary && (
        <ScanSummaryBar summary={scan.lastSummary} onDismiss={scan.clearSummary} />
      )}
      <InvoiceBody form={form} sortedItems={sortedItems} />
      {form.saveError && (
        <div className="shrink-0 border-t border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {form.saveError}
        </div>
      )}
      <InvoiceSummaryFooter
        summary={form.invoiceSummary}
        isSaving={form.isSaving}
        isSavingDraft={form.isSavingDraft}
        canSave={form.canSave}
        isDirty={form.isDirty}
        onSave={form.handleSave}
        onSaveDraft={form.handleSaveDraft}
      />
      <InvoiceModals
        categoryModalOpen={categoryModalOpen}
        itemModalOpen={itemModalOpen}
        categories={form.categories}
        unitOptions={form.unitOptions}
        onCloseCategory={() => setCategoryModalOpen(false)}
        onCloseItem={() => setItemModalOpen(false)}
        onSaveCategory={(category) => form.addCategory(category)}
        onSaveItem={(item) => form.addItem(item)}
      />
      <ScanInvoiceModal
        open={scan.modalOpen}
        status={scan.status}
        errorMessage={scan.errorMessage}
        selectedFile={scan.selectedFile}
        previewUrl={scan.previewUrl}
        onClose={scan.closeModal}
        onFileSelected={scan.handleFileSelected}
        onConfirmScan={scan.confirmScan}
        onChooseDifferentFile={scan.chooseDifferentFile}
      />
    </div>
  );
}
