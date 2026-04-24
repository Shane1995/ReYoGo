import { useMemo } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddCategoryModal } from "@/pages/Inventory/Capture/CapturedInventory/components/AddCategoryModal";
import { AddItemModal } from "@/pages/Inventory/Capture/CapturedInventory/components/AddItemModal";
import { useInvoiceForm } from "./hooks/useInvoiceForm";
import { InvoiceHeader } from "./InvoiceHeader";
import { ReuseNotice } from "./ReuseNotice";
import { InvoiceLineRow } from "./InvoiceLineRow";
import { InvoiceSummaryFooter } from "./InvoiceSummaryFooter";

export default function InvoicePage() {
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
    categoryModalOpen,
    setCategoryModalOpen,
    itemModalOpen,
    setItemModalOpen,
    expandedResultLineIds,
    isReused,
    reuseNoticeDismissed,
    setReuseNoticeDismissed,
    isSaving,
    saveError,
    toggleResultRow,
    addLine,
    removeLine,
    updateLine,
    clearForm,
    isDirty,
    itemsWithCategory,
    itemMetaMap,
    invoiceSummary,
    validLines,
    handleSave,
  } = useInvoiceForm();

  const sortedItems = useMemo(
    () => [...itemsWithCategory].sort((a, b) => a.name.localeCompare(b.name)),
    [itemsWithCategory]
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <InvoiceHeader
        invoiceNumber={invoiceNumber}
        onInvoiceNumberChange={setInvoiceNumber}
        invoiceDate={invoiceDate}
        onInvoiceDateChange={setInvoiceDate}
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
          <div className="rounded-lg border border-[var(--nav-border)] bg-background">
            <Table>
              <TableHeader>
                <TableRow className="border-[var(--nav-border)] hover:bg-transparent">
                  <TableHead className="w-8 p-2" />
                  <TableHead className="font-medium text-foreground">Item</TableHead>
                  <TableHead className="font-medium text-foreground w-24">Quantity</TableHead>
                  <TableHead className="font-medium text-foreground w-28">VAT</TableHead>
                  <TableHead className="font-medium text-foreground w-24">VAT Rate %</TableHead>
                  <TableHead className="font-medium text-foreground w-32">Total</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line, i) => (
                  <InvoiceLineRow
                    key={line.id}
                    line={line}
                    isExpanded={expandedResultLineIds.has(line.id)}
                    isLast={i === lines.length - 1}
                    sortedItems={sortedItems}
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
                  />
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-end border-t border-[var(--nav-border)] bg-muted/10 px-3 py-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => addLine()} className="gap-1.5">
                <PlusIcon className="size-4" aria-hidden />
                Add row
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
        hasValidLines={validLines.length > 0}
        onSave={handleSave}
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
