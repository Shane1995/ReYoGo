import { useEffect, useMemo, useState } from 'react';
import { AddCategoryModal } from '@/pages/Inventory/Capture/CapturedInventory/components/AddCategoryModal';
import { AddItemModal } from '@/pages/Inventory/Capture/CapturedInventory/components/AddItemModal';
import { useInvoiceForm } from './hooks/useInvoiceForm';
import { InvoiceHeader } from './components/InvoiceHeader';
import { ReuseNotice } from './components/ReuseNotice';
import { InvoiceLinesTable } from './components/InvoiceLinesTable';
import { InvoiceSummaryFooter } from './components/InvoiceSummaryFooter';
import { suppliersService } from '@/services/suppliers';
import type { Supplier } from '@reyogo/types';

export default function InvoicePage() {
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const {
    unitOptions,
    categories,
    addCategory,
    addItem,
    lines,
    invoiceNumber,
    setInvoiceNumber,
    invoiceDate,
    setInvoiceDate,
    supplierId,
    setSupplierId,
    vatMode,
    setVatMode,
    selectedEntity,
    entityId,
    expandedResultLineIds,
    isReused,
    reuseNoticeDismissed,
    setReuseNoticeDismissed,
    isSaving,
    isSavingDraft,
    saveError,
    toggleResultRow,
    addLine,
    removeLine,
    updateLine,
    clearForm,
    isDirty,
    canSave,
    itemsWithCategory,
    itemMetaMap,
    invoiceSummary,
    handleSave,
    handleSaveDraft,
  } = useInvoiceForm();

  useEffect(() => {
    if (!entityId) return;
    suppliersService.getSuppliers(entityId).then((s) => setSuppliers(s ?? []));
  }, [entityId]);

  const sortedItems = useMemo(
    () => [...itemsWithCategory].sort((a, b) => a.name.localeCompare(b.name)),
    [itemsWithCategory],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <InvoiceHeader
        invoiceNumber={invoiceNumber}
        onInvoiceNumberChange={setInvoiceNumber}
        invoiceDate={invoiceDate}
        onInvoiceDateChange={setInvoiceDate}
        supplierId={supplierId}
        onSupplierChange={setSupplierId}
        suppliers={suppliers}
        vatMode={vatMode}
        onVatModeChange={setVatMode}
        onAddCategory={() => setCategoryModalOpen(true)}
        onAddItem={() => setItemModalOpen(true)}
        isDirty={isDirty}
        onClear={clearForm}
      />

      {isReused && !reuseNoticeDismissed && (
        <ReuseNotice onDismiss={() => setReuseNoticeDismissed(true)} />
      )}

      <div className="min-h-0 flex-1 overflow-auto">
        <div className="mx-4 my-4">
          <InvoiceLinesTable
            lines={lines}
            vatMode={vatMode}
            vatRate={selectedEntity?.defaultVatRate ?? 0}
            expandedLineIds={expandedResultLineIds}
            sortedItems={sortedItems}
            entityId={entityId}
            itemMetaMap={itemMetaMap}
            onToggleExpand={toggleResultRow}
            onUpdateLine={updateLine}
            onRemoveLine={removeLine}
            onAddLine={addLine}
          />
        </div>
      </div>

      {saveError && (
        <div className="shrink-0 border-t border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {saveError}
        </div>
      )}

      <InvoiceSummaryFooter
        summary={invoiceSummary}
        isSaving={isSaving}
        isSavingDraft={isSavingDraft}
        canSave={canSave}
        isDirty={isDirty}
        onSave={handleSave}
        onSaveDraft={handleSaveDraft}
      />

      <AddCategoryModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSave={(category) => addCategory(category)}
      />
      <AddItemModal
        open={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        categories={categories}
        unitOptions={unitOptions}
        onSave={(item) => addItem(item)}
      />
    </div>
  );
}
