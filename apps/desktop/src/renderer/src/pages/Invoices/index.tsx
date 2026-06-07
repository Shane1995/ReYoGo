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
import type {
  InventoryCategory,
  InventoryItem,
} from '@/pages/Inventory/Capture/CapturedInventory/types';
import type { UnitOption } from '@/pages/Inventory/Capture/CapturedInventory/components/ItemsTable/types';

type InvoiceModalsProps = {
  categoryModalOpen: boolean;
  itemModalOpen: boolean;
  categories: InventoryCategory[];
  unitOptions: UnitOption[];
  onCloseCategory: () => void;
  onCloseItem: () => void;
  onSaveCategory: (category: Omit<InventoryCategory, 'id'>) => void;
  onSaveItem: (item: Omit<InventoryItem, 'id'>) => void;
};

function InvoiceModals({
  categoryModalOpen,
  itemModalOpen,
  categories,
  unitOptions,
  onCloseCategory,
  onCloseItem,
  onSaveCategory,
  onSaveItem,
}: InvoiceModalsProps) {
  return (
    <>
      <AddCategoryModal
        open={categoryModalOpen}
        onClose={onCloseCategory}
        onSave={onSaveCategory}
      />
      <AddItemModal
        open={itemModalOpen}
        onClose={onCloseItem}
        categories={categories}
        unitOptions={unitOptions}
        onSave={onSaveItem}
      />
    </>
  );
}

function useSuppliers(entityId: string | null): Supplier[] {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  useEffect(() => {
    if (!entityId) return;
    suppliersService.getSuppliers(entityId).then((s) => setSuppliers(s ?? []));
  }, [entityId]);
  return suppliers;
}

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
      <div className="min-h-0 flex-1 overflow-auto">
        <div className="mx-4 my-4">
          <InvoiceLinesTable
            lines={form.lines}
            vatMode={form.vatMode}
            vatRate={form.selectedEntity?.defaultVatRate ?? 0}
            expandedLineIds={form.expandedResultLineIds}
            sortedItems={sortedItems}
            entityId={form.entityId}
            itemMetaMap={form.itemMetaMap}
            onToggleExpand={form.toggleResultRow}
            onUpdateLine={form.updateLine}
            onRemoveLine={form.removeLine}
            onAddLine={form.addLine}
          />
        </div>
      </div>
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
