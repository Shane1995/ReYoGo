import { useState, useCallback } from "react";
import { RotateCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInventory } from "./Context/InventoryContext";
import { InventoryTreeTable } from "./components/InventoryTreeTable";
import type { TypeValue } from "./types";
import { UNIT_OPTIONS } from "./types";

export default function InventoryIndex() {
  const {
    categories,
    items,
    addCategory,
    updateCategory,
    addItem,
    updateItem,
    deleteCategoryFromBackend,
    deleteItemFromBackend,
    resetAll,
    submitInventory,
    hasPendingChanges,
  } = useInventory();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [confirmingDeleteCategoryId, setConfirmingDeleteCategoryId] = useState<string | null>(null);
  const [confirmingDeleteItemId, setConfirmingDeleteItemId] = useState<string | null>(null);

  const handleAddCategory = useCallback(
    (type: TypeValue) => addCategory({ name: "", type }),
    [addCategory]
  );

  const handleAddItem = useCallback(
    (categoryId: string) => {
      const category = categories.find((c) => c.id === categoryId);
      if (!category) return undefined;
      return addItem({
        name: "",
        categoryId,
        type: category.type,
        unitOfMeasure: UNIT_OPTIONS[0],
      });
    },
    [categories, addItem]
  );

  const handleSubmit = useCallback(async () => {
    if (!hasPendingChanges || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await submitInventory();
    } finally {
      setIsSubmitting(false);
    }
  }, [hasPendingChanges, isSubmitting, submitInventory]);

  const onRequestRemoveCategory = useCallback((id: string) => {
    setConfirmingDeleteCategoryId(id);
  }, []);

  const onRequestRemoveItem = useCallback((id: string) => {
    setConfirmingDeleteItemId(id);
  }, []);

  const onConfirmRemoveCategory = useCallback(() => {
    if (confirmingDeleteCategoryId) {
      const id = confirmingDeleteCategoryId;
      setConfirmingDeleteCategoryId(null);
      deleteCategoryFromBackend(id);
    }
  }, [confirmingDeleteCategoryId, deleteCategoryFromBackend]);

  const onCancelRemoveCategory = useCallback(() => {
    setConfirmingDeleteCategoryId(null);
  }, []);

  const onConfirmRemoveItem = useCallback(() => {
    if (confirmingDeleteItemId) {
      const id = confirmingDeleteItemId;
      setConfirmingDeleteItemId(null);
      deleteItemFromBackend(id);
    }
  }, [confirmingDeleteItemId, deleteItemFromBackend]);

  const onCancelRemoveItem = useCallback(() => {
    setConfirmingDeleteItemId(null);
  }, []);

  const handleResetAll = useCallback(async () => {
    if (isResetting) return;
    setIsResetting(true);
    await resetAll();
    setIsResetting(false);
  }, [resetAll, isResetting]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="shrink-0 border-b border-[var(--nav-border)] bg-background px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Captured Goods Received</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Manage categories and items. Submit to save changes.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetAll}
              disabled={!hasPendingChanges || isResetting}
              className="gap-1.5"
            >
              <RotateCcwIcon className="size-4" aria-hidden />
              {isResetting ? "Resetting…" : "Reset all"}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!hasPendingChanges || isSubmitting}
              size="sm"
              className={hasPendingChanges ? "border-[var(--nav-active-border)] bg-[var(--nav-active-border)] text-white hover:opacity-90" : undefined}
            >
              {isSubmitting ? "Saving…" : "Submit"}
            </Button>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-auto">
        <div className="mx-4 my-4">
          <InventoryTreeTable
            categories={categories}
            items={items}
            confirmingDeleteCategoryId={confirmingDeleteCategoryId}
            confirmingDeleteItemId={confirmingDeleteItemId}
            onRequestRemoveCategory={onRequestRemoveCategory}
            onRequestRemoveItem={onRequestRemoveItem}
            onConfirmRemoveCategory={onConfirmRemoveCategory}
            onCancelRemoveCategory={onCancelRemoveCategory}
            onConfirmRemoveItem={onConfirmRemoveItem}
            onCancelRemoveItem={onCancelRemoveItem}
            onAddCategory={handleAddCategory}
            onUpdateCategory={updateCategory}
            onAddItem={handleAddItem}
            onUpdateItem={updateItem}
          />
        </div>
      </div>
    </div>
  );
}
