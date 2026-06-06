import { useEffect, useMemo, useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { Button } from '@reyogo/ui';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@reyogo/ui';
import { AddCategoryModal } from '@/pages/Inventory/Capture/CapturedInventory/components/AddCategoryModal';
import { AddItemModal } from '@/pages/Inventory/Capture/CapturedInventory/components/AddItemModal';
import { useInvoiceForm } from './hooks/useInvoiceForm';
import { InvoiceHeader } from './components/InvoiceHeader';
import { ReuseNotice } from './components/ReuseNotice';
import { InvoiceLineRow } from './components/InvoiceLineRow';
import { InvoiceSummaryFooter } from './components/InvoiceSummaryFooter';
import { suppliersService } from '@/services/suppliers';
import type { Supplier } from '@reyogo/types';

export default function InvoicePage() {
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const {
    units,
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
    handleEntityChange,
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
        entityId={entityId}
        onEntityChange={handleEntityChange}
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
          <div className="rounded-lg border border-[var(--nav-border)] bg-background overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-[var(--nav-border)] hover:bg-transparent bg-muted/30">
                  <TableHead className="w-8 p-2" />
                  <TableHead className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 py-2.5">
                    Item
                  </TableHead>
                  <TableHead className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 py-2.5 w-24">
                    Qty
                  </TableHead>
                  <TableHead className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 py-2.5 w-20 text-center">
                    Tax
                  </TableHead>
                  <TableHead className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 py-2.5 w-32">
                    Total (excl.)
                  </TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line, i) => (
                  <InvoiceLineRow
                    key={line.id}
                    line={line}
                    index={i}
                    vatMode={vatMode}
                    vatRate={selectedEntity?.defaultVatRate ?? 0}
                    isExpanded={expandedResultLineIds.has(line.id)}
                    isLast={i === lines.length - 1}
                    sortedItems={sortedItems}
                    entityId={entityId}
                    itemMeta={itemMetaMap.get(line.itemId)}
                    onToggleExpand={() => toggleResultRow(line.id)}
                    onUpdate={(updates) => updateLine(line.id, updates)}
                    onRemove={() => removeLine(line.id)}
                    onAddLine={addLine}
                    onNavigateNext={(field) => {
                      const nextLine = lines[i + 1];
                      if (nextLine) {
                        document.getElementById(`invoice-${field}-${nextLine.id}`)?.focus();
                      } else {
                        addLine(field);
                      }
                    }}
                    onNavigatePrev={(field) => {
                      const prevLine = lines[i - 1];
                      if (prevLine) {
                        document.getElementById(`invoice-${field}-${prevLine.id}`)?.focus();
                      }
                    }}
                    onNavigateToNextRowItem={() => {
                      const nextLine = lines[i + 1];
                      if (nextLine) {
                        document.getElementById(`invoice-item-${nextLine.id}`)?.focus();
                      }
                    }}
                  />
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-start border-t border-[var(--nav-border)] bg-muted/10 px-3 py-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => addLine()}
                className="gap-1.5 text-muted-foreground hover:text-foreground text-xs"
              >
                <PlusIcon className="size-3.5" aria-hidden />
                Add line
              </Button>
            </div>
          </div>
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
        units={units}
        onSave={(item) => addItem(item)}
      />
    </div>
  );
}
