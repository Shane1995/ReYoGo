import { Fragment, useState, useCallback } from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  RotateCcwIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useInventory } from "../Context/InventoryContext";
import { TYPE_LABELS, TYPE_VALUES, UNIT_OPTIONS } from "../types";
import type { TypeValue, InventoryCategory, InventoryItem, UnitOfMeasure } from "../types";

const TYPE_ROW_COLORS: Record<TypeValue, string> = {
  food: "bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-800/30",
  drink: "bg-cyan-50 dark:bg-cyan-900/20 hover:bg-cyan-100 dark:hover:bg-cyan-800/30",
  "non-perishable": "bg-stone-50 dark:bg-stone-800/20 hover:bg-stone-100 dark:hover:bg-stone-700/30",
};

const inputClass = cn(
  "h-8 w-full rounded-md border border-input bg-background px-2.5 text-sm",
  "focus:outline-none focus:ring-2 focus:ring-[var(--nav-active-border)]/50 focus:ring-offset-0"
);

type InventoryTreeTableProps = {
  categories: InventoryCategory[];
  items: InventoryItem[];
  confirmingDeleteCategoryId: string | null;
  confirmingDeleteItemId: string | null;
  onRequestRemoveCategory: (id: string) => void;
  onRequestRemoveItem: (id: string) => void;
  onConfirmRemoveCategory: () => void;
  onCancelRemoveCategory: () => void;
  onConfirmRemoveItem: () => void;
  onCancelRemoveItem: () => void;
  onAddCategory: (type: TypeValue) => string | void;
  onUpdateCategory: (id: string, updates: Partial<InventoryCategory>) => void;
  onAddItem: (categoryId: string) => string | void;
  onUpdateItem: (id: string, updates: Partial<InventoryItem>) => void;
};

export function InventoryTreeTable({
  categories,
  items,
  confirmingDeleteCategoryId,
  confirmingDeleteItemId,
  onRequestRemoveCategory,
  onRequestRemoveItem,
  onConfirmRemoveCategory,
  onCancelRemoveCategory,
  onConfirmRemoveItem,
  onCancelRemoveItem,
  onAddCategory,
  onUpdateCategory,
  onAddItem,
  onUpdateItem,
}: InventoryTreeTableProps) {
  const [expandedTypes, setExpandedTypes] = useState<Set<TypeValue>>(() => new Set(TYPE_VALUES));
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const toggleType = useCallback((type: TypeValue) => {
    setExpandedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  const toggleCategory = useCallback((id: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const { pendingCategoryIds, pendingItemIds, submittingCategoryIds, submittingItemIds, recentlySavedCategoryIds, recentlySavedItemIds, submitCategory, submitItem, revertCategory, revertItem } = useInventory();
  const categoriesByType = TYPE_VALUES.map((type) => ({
    type,
    categories: categories.filter((c) => c.type === type),
  }));

  return (
    <div className="relative rounded-lg border border-[var(--nav-border)] overflow-hidden bg-background">
      <Table>
        <TableBody>
          {categoriesByType.map(({ type, categories: typeCategories }) => {
            const isTypeExpanded = expandedTypes.has(type);
            const typePendingCount = typeCategories.filter((c) => pendingCategoryIds.has(c.id)).length;
            return (
              <Fragment key={type}>
                <TableRow
                  key={type}
                  className={cn(
                    "border-[var(--nav-border)] cursor-pointer select-none text-[var(--nav-foreground)]",
                    TYPE_ROW_COLORS[type]
                  )}
                  onClick={() => toggleType(type)}
                >
                  <TableCell className="py-2 px-4 align-middle">
                    <div className="flex items-center gap-2">
                      <span className="shrink-0 text-[var(--nav-foreground-muted)]">
                        {isTypeExpanded ? (
                          <ChevronDownIcon className="size-4" aria-hidden />
                        ) : (
                          <ChevronRightIcon className="size-4" aria-hidden />
                        )}
                      </span>
                      <span className="font-medium text-[var(--nav-foreground)]">
                        {TYPE_LABELS[type]}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2 px-4 align-middle" onClick={(e) => e.stopPropagation()}>
                    {isTypeExpanded && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-[var(--nav-foreground)] hover:bg-[var(--nav-accent)] hover:text-[var(--nav-active-border)]"
                        onClick={(e) => {
                          e.stopPropagation();
                          const newId = onAddCategory(type);
                          if (newId) {
                            setExpandedCategories((prev) => new Set(prev).add(newId));
                            setEditingCategoryId(newId);
                          }
                        }}
                      >
                        <PlusIcon className="size-4" aria-hidden />
                        Add category
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="py-2 px-4 align-middle text-right" onClick={(e) => e.stopPropagation()}>
                    {typePendingCount > 0 ? (
                      <span className="inline-flex size-6 items-center justify-center rounded-full bg-orange-500 text-xs font-semibold text-white">
                        {typePendingCount}
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                </TableRow>

                {isTypeExpanded && (
                  <TableRow className="border-[var(--nav-border)] bg-transparent hover:bg-transparent">
                    <TableCell colSpan={3} className="p-0 align-top">
                      <div className="pl-4 pr-4 pb-2">
                        {typeCategories.length > 0 ? (
                          <Table className="rounded-lg border border-[var(--nav-border)] overflow-hidden">
                            <TableBody>
                              {typeCategories.map((category) => {
                                const categoryItems = items.filter((i) => i.categoryId === category.id);
                                const pendingItemCount = categoryItems.filter((i) => pendingItemIds.has(i.id)).length;
                                const categoryIsPending = pendingCategoryIds.has(category.id);
                                const isCategoryExpanded = expandedCategories.has(category.id);
                                const isEditingCategory = editingCategoryId === category.id;
                                const unsavedCount = (categoryIsPending ? 1 : 0) + pendingItemCount;

                                const categoryConfirmingDelete = confirmingDeleteCategoryId === category.id;
                                const categorySubmitting = submittingCategoryIds.has(category.id);
                                return (
                                  <Fragment key={category.id}>
                                    <TableRow
                                      className={cn(
                                        "border-[var(--nav-border)]",
                                        "bg-[var(--nav-bg)]/60 hover:bg-[var(--nav-accent)]/40 text-[var(--nav-foreground)]",
                                        categoryConfirmingDelete && "bg-destructive/20",
                                        categorySubmitting && "opacity-75 pointer-events-none"
                                      )}
                                    >
                                      <TableCell
                                        className={cn(
                                          "py-2 pl-8 pr-2 align-middle",
                                          (pendingCategoryIds.has(category.id) || recentlySavedCategoryIds.has(category.id)) &&
                                          "border-l-4 border-l-red-500"
                                        )}
                                      >
                                        <div className="flex items-center gap-2">
                                          <button
                                            type="button"
                                            className="shrink-0 text-[var(--nav-foreground-muted)] hover:text-[var(--nav-active-border)] p-0.5 -m-0.5"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleCategory(category.id);
                                            }}
                                            aria-label={isCategoryExpanded ? "Collapse" : "Expand"}
                                          >
                                            {categoryItems.length > 0 ? (
                                              isCategoryExpanded ? (
                                                <ChevronDownIcon className="size-4" aria-hidden />
                                              ) : (
                                                <ChevronRightIcon className="size-4" aria-hidden />
                                              )
                                            ) : (
                                              <span className="inline-block w-4 h-4" aria-hidden />
                                            )}
                                          </button>
                                          {isEditingCategory && !categoryConfirmingDelete ? (
                                            <input
                                              value={category.name}
                                              onChange={(e) =>
                                                onUpdateCategory(category.id, { name: e.target.value })
                                              }
                                              onBlur={() => setEditingCategoryId(null)}
                                              onKeyDown={(e) => {
                                                if (e.key === "Enter") setEditingCategoryId(null);
                                              }}
                                              className={cn(inputClass, "min-w-[10rem]")}
                                              autoFocus
                                              onClick={(e) => e.stopPropagation()}
                                            />
                                          ) : (
                                            <span
                                              className={cn(
                                                "text-sm text-[var(--nav-foreground)]",
                                                !categoryConfirmingDelete && "cursor-pointer hover:underline hover:text-[var(--nav-active-border)]"
                                              )}
                                              onClick={() => !categoryConfirmingDelete && setEditingCategoryId(category.id)}
                                            >
                                              {category.name || "—"}
                                            </span>
                                          )}
                                        </div>
                                      </TableCell>
                                      <TableCell className="py-2 px-2 align-middle" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center gap-1">
                                          {categoryConfirmingDelete ? (
                                            <>
                                              <Button type="button" variant="outline" size="sm" onClick={onCancelRemoveCategory}>
                                                Cancel
                                              </Button>
                                              <Button type="button" variant="destructive" size="sm" onClick={onConfirmRemoveCategory}>
                                                Confirm
                                              </Button>
                                            </>
                                          ) : (
                                            <>
                                              {categorySubmitting ? (
                                                <span className="flex items-center gap-1.5 text-sm text-muted-foreground" aria-live="polite">
                                                  <Loader2Icon className="size-4 animate-spin" aria-hidden />
                                                  Saving…
                                                </span>
                                              ) : pendingCategoryIds.has(category.id) ? (
                                                <>
                                                  <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8 text-[var(--nav-active-border)] hover:bg-[var(--nav-accent)]"
                                                    onClick={() => submitCategory(category.id)}
                                                    aria-label="Submit this category"
                                                  >
                                                    <UploadIcon className="size-4" aria-hidden />
                                                  </Button>
                                                  <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8 text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10"
                                                    onClick={() => revertCategory(category.id)}
                                                    aria-label="Reset this category"
                                                  >
                                                    <RotateCcwIcon className="size-4" aria-hidden />
                                                  </Button>
                                                </>
                                              ) : null}
                                              {!categorySubmitting && !isEditingCategory && (
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="sm"
                                                  className="gap-1 text-[var(--nav-foreground)] hover:bg-[var(--nav-accent)] hover:text-[var(--nav-active-border)]"
                                                  onClick={() => {
                                                    const newId = onAddItem(category.id);
                                                    if (newId) {
                                                      setExpandedCategories((prev) => new Set(prev).add(category.id));
                                                      setEditingItemId(newId);
                                                    }
                                                  }}
                                                >
                                                  <PlusIcon className="size-3.5" aria-hidden />
                                                  Add item
                                                </Button>
                                              )}
                                              {!categorySubmitting && !isEditingCategory && (
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="icon"
                                                  className="size-8 text-[var(--nav-foreground-muted)] hover:text-[var(--nav-active-border)] hover:bg-[var(--nav-accent)]"
                                                  onClick={() => setEditingCategoryId(category.id)}
                                                  aria-label="Edit category"
                                                >
                                                  <PencilIcon className="size-4" aria-hidden />
                                                </Button>
                                              )}
                                              {!categorySubmitting && (
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="icon"
                                                  className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                  onClick={() => onRequestRemoveCategory(category.id)}
                                                  aria-label="Remove category"
                                                >
                                                  <Trash2Icon className="size-4" aria-hidden />
                                                </Button>
                                              )}
                                            </>
                                          )}
                                        </div>
                                      </TableCell>
                                      <TableCell className="py-2 px-2 align-middle text-right">
                                        {unsavedCount > 0 ? (
                                          <span className="inline-flex size-6 items-center justify-center rounded-full bg-orange-500 text-xs font-semibold text-white">
                                            {unsavedCount}
                                          </span>
                                        ) : (
                                          "—"
                                        )}
                                      </TableCell>
                                    </TableRow>

                                    {isCategoryExpanded && categoryItems.length > 0 && (
                                      <TableRow className="border-[var(--nav-border)] bg-transparent hover:bg-transparent">
                                        <TableCell colSpan={3} className="p-0 align-top">
                                          <div className="pl-8 pr-2 pb-2">
                                            <Table className="rounded-lg border border-[var(--nav-border)] overflow-hidden">
                                              <TableHeader>
                                                <TableRow className="border-[var(--nav-border)] bg-[var(--nav-accent)]/50 hover:bg-[var(--nav-accent)]/50">
                                                  <TableHead className="w-[min(40%,20rem)] py-1.5 px-2 text-xs font-semibold text-[var(--nav-foreground)]">
                                                    Name
                                                  </TableHead>
                                                  <TableHead className="w-[8rem] py-1.5 px-2 text-xs font-semibold text-[var(--nav-foreground)]">
                                                    Unit
                                                  </TableHead>
                                                  <TableHead className="py-1.5 px-2 text-xs font-semibold text-[var(--nav-foreground)]">
                                                    Actions
                                                  </TableHead>
                                                </TableRow>
                                              </TableHeader>
                                              <TableBody>
                                                {categoryItems.map((item) => {
                                                  const isEditingItem = editingItemId === item.id;
                                                  const itemConfirmingDelete = confirmingDeleteItemId === item.id;
                                                  const itemSubmitting = submittingItemIds.has(item.id);
                                                  const handleRowBlur = (e: React.FocusEvent) => {
                                                    const row = e.currentTarget.closest("tr");
                                                    setTimeout(() => {
                                                      if (row && !row.contains(document.activeElement)) {
                                                        setEditingItemId(null);
                                                      }
                                                    }, 0);
                                                  };
                                                  return (
                                                    <TableRow
                                                      key={item.id}
                                                      className={cn(
                                                        "border-[var(--nav-border)]",
                                                        "bg-[var(--nav-bg)]/50 hover:bg-[var(--nav-accent)]/30 text-[var(--nav-foreground)]",
                                                        itemConfirmingDelete && "bg-destructive/20",
                                                        itemSubmitting && "opacity-75 pointer-events-none"
                                                      )}
                                                    >
                                                      <TableCell
                                                        className={cn(
                                                          "py-2 pl-8 pr-2 align-middle",
                                                          (pendingItemIds.has(item.id) || recentlySavedItemIds.has(item.id)) &&
                                                          "border-l-4 border-l-red-500"
                                                        )}
                                                      >
                                                        <div className="flex items-center gap-2">
                                                          {isEditingItem && !itemConfirmingDelete ? (
                                                            <input
                                                              value={item.name}
                                                              onChange={(e) =>
                                                                onUpdateItem(item.id, { name: e.target.value })
                                                              }
                                                              onBlur={handleRowBlur}
                                                              onKeyDown={(e) => {
                                                                if (e.key === "Enter") setEditingItemId(null);
                                                              }}
                                                              className={cn(inputClass, "min-w-[10rem]")}
                                                              autoFocus
                                                              placeholder="Name"
                                                            />
                                                          ) : (
                                                            <span
                                                              className={cn(
                                                                "text-sm text-[var(--nav-foreground)]",
                                                                !itemConfirmingDelete && "cursor-pointer hover:underline hover:text-[var(--nav-active-border)]"
                                                              )}
                                                              onClick={() => !itemConfirmingDelete && setEditingItemId(item.id)}
                                                            >
                                                              {item.name || "—"}
                                                            </span>
                                                          )}
                                                        </div>
                                                      </TableCell>
                                                      <TableCell className="py-2 px-2 align-middle">
                                                        {itemConfirmingDelete ? (
                                                          <span className="text-sm text-[var(--nav-foreground)]">
                                                            {item.unitOfMeasure ?? "—"}
                                                          </span>
                                                        ) : isEditingItem ? (
                                                          <select
                                                            value={item.unitOfMeasure ?? ""}
                                                            onChange={(e) =>
                                                              onUpdateItem(item.id, {
                                                                unitOfMeasure: (e.target.value || undefined) as UnitOfMeasure | undefined,
                                                              })
                                                            }
                                                            onBlur={handleRowBlur}
                                                            className={cn(inputClass, "min-w-[6rem] cursor-pointer")}
                                                          >
                                                            <option value="">Select</option>
                                                            {UNIT_OPTIONS.map((u) => (
                                                              <option key={u} value={u}>
                                                                {u}
                                                              </option>
                                                            ))}
                                                          </select>
                                                        ) : (
                                                          <span
                                                            className="text-sm text-[var(--nav-foreground)] cursor-pointer hover:underline hover:text-[var(--nav-active-border)]"
                                                            onClick={() => setEditingItemId(item.id)}
                                                          >
                                                            {item.unitOfMeasure ?? "—"}
                                                          </span>
                                                        )}
                                                      </TableCell>
                                                      <TableCell className="py-2 px-2 align-middle" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex items-center gap-1">
                                                          {itemConfirmingDelete ? (
                                                            <>
                                                              <Button type="button" variant="outline" size="sm" onClick={onCancelRemoveItem}>
                                                                Cancel
                                                              </Button>
                                                              <Button type="button" variant="destructive" size="sm" onClick={onConfirmRemoveItem}>
                                                                Confirm
                                                              </Button>
                                                            </>
                                                          ) : (
                                                            <>
                                                              {itemSubmitting ? (
                                                                <span className="flex items-center gap-1.5 text-sm text-muted-foreground" aria-live="polite">
                                                                  <Loader2Icon className="size-4 animate-spin" aria-hidden />
                                                                  Saving…
                                                                </span>
                                                              ) : pendingItemIds.has(item.id) ? (
                                                                <>
                                                                  <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="size-8 text-[var(--nav-active-border)] hover:bg-[var(--nav-accent)]"
                                                                    onClick={() => submitItem(item.id)}
                                                                    aria-label="Submit this item"
                                                                  >
                                                                    <UploadIcon className="size-4" aria-hidden />
                                                                  </Button>
                                                                  <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="size-8 text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10"
                                                                    onClick={() => revertItem(item.id)}
                                                                    aria-label="Reset this item"
                                                                  >
                                                                    <RotateCcwIcon className="size-4" aria-hidden />
                                                                  </Button>
                                                                </>
                                                              ) : null}
                                                              {!itemSubmitting && !isEditingItem && (
                                                                <Button
                                                                  type="button"
                                                                  variant="ghost"
                                                                  size="icon"
                                                                  className="size-8 text-[var(--nav-foreground-muted)] hover:text-[var(--nav-active-border)] hover:bg-[var(--nav-accent)]"
                                                                  onClick={() => setEditingItemId(item.id)}
                                                                  aria-label="Edit item"
                                                                >
                                                                  <PencilIcon className="size-4" aria-hidden />
                                                                </Button>
                                                              )}
                                                              {!itemSubmitting && (
                                                                <Button
                                                                  type="button"
                                                                  variant="ghost"
                                                                  size="icon"
                                                                  className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                                  onClick={() => onRequestRemoveItem(item.id)}
                                                                  aria-label="Remove item"
                                                                >
                                                                  <Trash2Icon className="size-4" aria-hidden />
                                                                </Button>
                                                              )}
                                                            </>
                                                          )}
                                                        </div>
                                                      </TableCell>
                                                    </TableRow>
                                                  );
                                                })}
                                              </TableBody>
                                            </Table>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    )}
                                  </Fragment>
                                );
                              })}
                            </TableBody>
                          </Table>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
