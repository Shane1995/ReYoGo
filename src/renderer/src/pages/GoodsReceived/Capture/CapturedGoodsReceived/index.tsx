import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, PencilIcon } from "lucide-react";
import { AnalysisRoutes } from "@/components/AppRoutes/routePaths";
import { useInventory } from "./Context/InventoryContext";
import { InventoryTreeTable } from "./components/InventoryTreeTable";
import { InventoryViewTable } from "./components/InventoryViewTable";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TypeValue } from "./types";

type Mode = "view" | "edit";

export default function InventoryIndex() {
  const {
    categories,
    items,
    units,
    goodTypes,
    addCategory,
    updateCategory,
    addItem,
    updateItem,
    removeCategory,
    removeItem,
    deleteCategoryFromBackend,
    deleteItemFromBackend,
  } = useInventory();

  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("view");

  const handleViewInsights = useCallback(
    (itemId: string) => navigate(AnalysisRoutes.CostPerUnit, { state: { itemId } }),
    [navigate]
  );
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
      return addItem({ name: "", categoryId, type: category.type, unitOfMeasure: units[0] });
    },
    [categories, addItem]
  );

  const onRequestRemoveCategory = useCallback((id: string) => setConfirmingDeleteCategoryId(id), []);
  const onRequestRemoveItem = useCallback((id: string) => setConfirmingDeleteItemId(id), []);

  const onConfirmRemoveCategory = useCallback(() => {
    if (confirmingDeleteCategoryId) {
      const id = confirmingDeleteCategoryId;
      setConfirmingDeleteCategoryId(null);
      deleteCategoryFromBackend(id);
    }
  }, [confirmingDeleteCategoryId, deleteCategoryFromBackend]);

  const onCancelRemoveCategory = useCallback(() => setConfirmingDeleteCategoryId(null), []);

  const onConfirmRemoveItem = useCallback(() => {
    if (confirmingDeleteItemId) {
      const id = confirmingDeleteItemId;
      setConfirmingDeleteItemId(null);
      deleteItemFromBackend(id);
    }
  }, [confirmingDeleteItemId, deleteItemFromBackend]);

  const onCancelRemoveItem = useCallback(() => setConfirmingDeleteItemId(null), []);

  const onBulkDeleteItems = useCallback(
    (ids: string[]) => ids.forEach((id) => deleteItemFromBackend(id)),
    [deleteItemFromBackend]
  );

  const onBulkDeleteCategories = useCallback(
    (ids: string[]) => ids.forEach((id) => deleteCategoryFromBackend(id)),
    [deleteCategoryFromBackend]
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="shrink-0 border-b border-border px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Captured Goods Received
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {mode === "view"
                ? "Browse your categories and items."
                : "Organise categories and items. Click any name to edit · Tab to move between fields · Tab after unit to add the next row."}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1 rounded-lg border border-[var(--nav-border)] bg-[var(--nav-accent)]/40 p-1">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className={cn(
                "h-7 gap-1.5 text-xs",
                mode === "view"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-[var(--nav-foreground-muted)] hover:text-[var(--nav-foreground)]"
              )}
              onClick={() => setMode("view")}
            >
              <EyeIcon className="size-3.5" />
              View
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className={cn(
                "h-7 gap-1.5 text-xs",
                mode === "edit"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-[var(--nav-foreground-muted)] hover:text-[var(--nav-foreground)]"
              )}
              onClick={() => setMode("edit")}
            >
              <PencilIcon className="size-3.5" />
              Edit
            </Button>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-auto">
        <div className="mx-6 my-5">
          {mode === "view" ? (
            <InventoryViewTable categories={categories} items={items} onViewInsights={handleViewInsights} />
          ) : (
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
              onDiscardCategory={removeCategory}
              onAddItem={handleAddItem}
              onUpdateItem={updateItem}
              onDiscardItem={removeItem}
              onBulkDeleteItems={onBulkDeleteItems}
              onBulkDeleteCategories={onBulkDeleteCategories}
              onViewInsights={handleViewInsights}
              units={units}
              goodTypes={goodTypes}
            />
          )}
        </div>
      </div>
    </div>
  );
}
