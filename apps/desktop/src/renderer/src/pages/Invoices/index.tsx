import { useMemo, useState } from 'react';
import { useInvoiceForm } from './hooks/useInvoiceForm';
import { useSuppliers } from './hooks/useSuppliers';
import { InvoiceHeader } from './components/InvoiceHeader';
import { ReuseNotice } from './components/ReuseNotice';
import { InvoiceBody } from './components/InvoiceBody';
import { InvoiceSummaryFooter } from './components/InvoiceSummaryFooter';
import { InvoiceModals } from './components/InvoiceModals';

export default function InvoicePage() {
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);

  const form = useInvoiceForm();
  const suppliers = useSuppliers(form.entityId);
  const sortedItems = useMemo(
    () => [...form.itemsWithCategory].sort((a, b) => a.name.localeCompare(b.name)),
    [form.itemsWithCategory],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <InvoiceHeader
        invoiceNumber={form.invoiceNumber}
        onInvoiceNumberChange={form.setInvoiceNumber}
        invoiceDate={form.invoiceDate}
        onInvoiceDateChange={form.setInvoiceDate}
        supplierId={form.supplierId}
        onSupplierChange={form.setSupplierId}
        suppliers={suppliers}
        vatMode={form.vatMode}
        onVatModeChange={form.setVatMode}
        onAddCategory={() => setCategoryModalOpen(true)}
        onAddItem={() => setItemModalOpen(true)}
        isDirty={form.isDirty}
        onClear={form.clearForm}
      />
      {form.isReused && !form.reuseNoticeDismissed && (
        <ReuseNotice onDismiss={() => form.setReuseNoticeDismissed(true)} />
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
    </div>
  );
}
