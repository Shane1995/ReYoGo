import { Fragment, useState, useCallback, useRef } from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  MoveRightIcon,
  SearchIcon,
  XIcon,
  LineChartIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { TypeValue, InventoryCategory, InventoryItem } from "../../types";
import { getTypeConfig } from "../../utils/typeConfig";
import { Highlight } from "../Highlight";
import { MoveItemSelect } from "../MoveItemSelect";
import { BulkActionBar } from "../BulkActionBar";
import { useInventorySelection } from "../../hooks/useInventorySelection";

const inputClass = cn(
  "h-8 w-full rounded-md border border-input bg-background px-2.5 text-sm",
  "focus:outline-none focus:ring-2 focus:ring-ring/50 focus:ring-offset-0"
);

const checkboxClass = cn(
  "size-4 cursor-pointer rounded border border-input bg-background",
  "accent-primary focus:outline-none focus:ring-2 focus:ring-ring/50"
);

export type InventoryTreeTableProps = {
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
  onAddCategory: (type: TypeValue) => string | undefined;
  onUpdateCategory: (id: string, updates: Partial<InventoryCategory>) => void;
  onDiscardCategory: (id: string) => void;
  onAddItem: (categoryId: string) => string | undefined;
  onUpdateItem: (id: string, updates: Partial<InventoryItem>) => void;
  onDiscardItem: (id: string) => void;
  onBulkDeleteItems: (ids: string[]) => void;
  onBulkDeleteCategories: (ids: string[]) => void;
  onViewInsights: (itemId: string) => void;
  units: string[];
  goodTypes: string[];
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
  onDiscardCategory,
  onAddItem,
  onUpdateItem,
  onDiscardItem,
  onBulkDeleteItems,
  onBulkDeleteCategories,
  onViewInsights,
  units,
  goodTypes,
}: InventoryTreeTableProps) {
  const allTypes = Array.from(new Set([...goodTypes, ...categories.map((c) => c.type).filter(Boolean)]));
  const [expandedTypes, setExpandedTypes] = useState<Set<TypeValue>>(() => new Set(allTypes));
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [movingItemId, setMovingItemId] = useState<string | null>(null);
  const [quickAddCategoryId, setQuickAddCategoryId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const committingItemRef = useRef<string | null>(null);

  const {
    selectedItemIds,
    selectedCategoryIds,
    hasSelection,
    clearSelection,
    toggleItemSelection,
    toggleCategorySelection,
    toggleAllItemsInCategory,
    setSelectedItemIds,
    setSelectedCategoryIds,
  } = useInventorySelection();

  const query = search.trim().toLowerCase();

  const toggleType = useCallback((type: TypeValue) => {
    setExpandedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type); else next.add(type);
      return next;
    });
  }, []);

  const toggleCategory = useCallback((id: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const startEditCategory = useCallback((category: InventoryCategory) => {
    setEditingItemId(null);
    setMovingItemId(null);
    setQuickAddCategoryId(null);
    setEditingCategoryId(category.id);
    setEditDraft(category.name);
  }, []);

  const commitCategoryEdit = useCallback(
    (categoryId: string, originalName: string) => {
      const trimmed = editDraft.trim();
      if (trimmed) { onUpdateCategory(categoryId, { name: trimmed }); }
      else if (!originalName) { onDiscardCategory(categoryId); }
      setEditingCategoryId(null);
    },
    [editDraft, onUpdateCategory, onDiscardCategory]
  );

  const startEditItem = useCallback((item: InventoryItem, isQuickAdd = false) => {
    setEditingCategoryId(null);
    setMovingItemId(null);
    if (!isQuickAdd) setQuickAddCategoryId(null);
    setEditingItemId(item.id);
    setEditDraft(item.name);
  }, []);

  const commitItemEdit = useCallback(
    (itemId: string, originalName: string, categoryId: string, addNext = false) => {
      committingItemRef.current = itemId;
      const trimmed = editDraft.trim();
      if (trimmed) { onUpdateItem(itemId, { name: trimmed }); }
      else if (!originalName) { onDiscardItem(itemId); }
      setEditingItemId(null);
      setQuickAddCategoryId(null);
      if (addNext && trimmed) {
        const newId = onAddItem(categoryId);
        if (newId) {
          setExpandedCategories((prev) => new Set(prev).add(categoryId));
          setEditingItemId(newId);
          setEditDraft("");
          setQuickAddCategoryId(categoryId);
        }
      }
    },
    [editDraft, onUpdateItem, onDiscardItem, onAddItem]
  );

  const handleMoveItem = useCallback(
    (itemId: string, newCategoryId: string, newType: TypeValue) => {
      onUpdateItem(itemId, { categoryId: newCategoryId, type: newType });
      setMovingItemId(null);
    },
    [onUpdateItem]
  );

  const startQuickAdd = useCallback(
    (categoryId: string) => {
      const newId = onAddItem(categoryId);
      if (newId) {
        setExpandedCategories((prev) => new Set(prev).add(categoryId));
        setEditingItemId(newId);
        setEditDraft("");
        setQuickAddCategoryId(categoryId);
      }
    },
    [onAddItem]
  );

  const handleBulkMoveItems = useCallback(
    (categoryId: string, type: TypeValue) => {
      selectedItemIds.forEach((id) => onUpdateItem(id, { categoryId, type }));
      setSelectedItemIds(new Set());
    },
    [selectedItemIds, onUpdateItem, setSelectedItemIds]
  );

  const handleBulkMoveCategories = useCallback(
    (type: TypeValue) => {
      selectedCategoryIds.forEach((id) => {
        onUpdateCategory(id, { type });
        items.filter((i) => i.categoryId === id).forEach((item) => onUpdateItem(item.id, { type }));
      });
      setSelectedCategoryIds(new Set());
    },
    [selectedCategoryIds, onUpdateCategory, onUpdateItem, items, setSelectedCategoryIds]
  );

  const handleBulkDeleteItems = useCallback(() => {
    onBulkDeleteItems(Array.from(selectedItemIds));
    setSelectedItemIds(new Set());
  }, [selectedItemIds, onBulkDeleteItems, setSelectedItemIds]);

  const handleBulkDeleteCategories = useCallback(() => {
    onBulkDeleteCategories(Array.from(selectedCategoryIds));
    setSelectedCategoryIds(new Set());
  }, [selectedCategoryIds, onBulkDeleteCategories, setSelectedCategoryIds]);

  const getFilteredData = useCallback(
    (typeCategories: InventoryCategory[]) => {
      if (!query) return { filteredCategories: typeCategories, matchingItemsByCategory: null };
      const matchingItemsByCategory = new Map<string, InventoryItem[]>();
      const filteredCategories: InventoryCategory[] = [];
      for (const cat of typeCategories) {
        const catMatches = cat.name.toLowerCase().includes(query);
        const matchingItems = items.filter((i) => i.categoryId === cat.id && i.name.toLowerCase().includes(query));
        if (catMatches || matchingItems.length > 0) {
          filteredCategories.push(cat);
          matchingItemsByCategory.set(cat.id, catMatches ? items.filter((i) => i.categoryId === cat.id) : matchingItems);
        }
      }
      return { filteredCategories, matchingItemsByCategory };
    },
    [query, items]
  );

  const totalCategories = categories.filter((c) => c.name.trim()).length;
  const totalItems = items.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={searchRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories or items…"
            className="h-8 w-full rounded-md bg-transparent pl-8 pr-8 text-sm outline-none placeholder:text-muted-foreground"
          />
          {search && (
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => { setSearch(""); searchRef.current?.focus(); }}
            >
              <XIcon className="size-4" />
            </button>
          )}
        </div>
        <div className="h-5 w-px bg-border shrink-0" />
        <div className="flex shrink-0 items-center gap-3 text-sm">
          <span className="text-muted-foreground"><span className="font-semibold text-foreground">{totalCategories}</span> categories</span>
          <span className="text-muted-foreground"><span className="font-semibold text-foreground">{totalItems}</span> items</span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {allTypes.map((type) => {
            const cfg = getTypeConfig(type, allTypes);
            const TypeIcon = cfg.icon;
            const count = items.filter((i) => i.type === type).length;
            return (
              <span key={type} className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <TypeIcon className={cn("size-3.5", cfg.color)} />
                {count}
              </span>
            );
          })}
        </div>
      </div>

      {hasSelection && (
        <BulkActionBar
          selectedItemIds={selectedItemIds}
          selectedCategoryIds={selectedCategoryIds}
          categories={categories}
          allTypes={allTypes}
          onClearSelection={clearSelection}
          onBulkMoveItems={handleBulkMoveItems}
          onBulkMoveCategories={handleBulkMoveCategories}
          onBulkDeleteItems={handleBulkDeleteItems}
          onBulkDeleteCategories={handleBulkDeleteCategories}
        />
      )}

      {allTypes.map((type) => {
        const cfg = getTypeConfig(type, allTypes);
        const TypeIcon = cfg.icon;
        const isExpanded = expandedTypes.has(type);
        const typeCategories = categories.filter((c) => c.type === type);
        const { filteredCategories, matchingItemsByCategory } = getFilteredData(typeCategories);

        if (query && filteredCategories.length === 0) return null;

        const typeItemCount = items.filter((i) => i.type === type).length;

        return (
          <div key={type} className="overflow-hidden rounded-xl border border-border bg-background">
            <div className="flex items-center gap-2.5 border-b border-border px-4 py-3 transition-colors hover:bg-muted/40">
              <div
                role="button"
                tabIndex={0}
                className="flex flex-1 cursor-pointer items-center gap-2.5"
                onClick={() => toggleType(type)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") toggleType(type); }}
              >
                <span className="shrink-0 text-muted-foreground">
                  {isExpanded ? <ChevronDownIcon className="size-4" /> : <ChevronRightIcon className="size-4" />}
                </span>
                <TypeIcon className={cn("size-4 shrink-0", cfg.color)} />
                <span className="font-semibold text-sm text-foreground">{type}</span>
                <Badge className={cn("text-[11px] font-medium", cfg.badgeClass)}>
                  {typeCategories.filter((c) => c.name.trim()).length} cats · {typeItemCount} items
                </Badge>
              </div>
              {isExpanded && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-auto h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    const newId = onAddCategory(type);
                    if (newId) {
                      setExpandedCategories((prev) => new Set(prev).add(newId));
                      setEditingCategoryId(newId);
                      setEditDraft("");
                    }
                  }}
                >
                  <PlusIcon className="size-3.5" />
                  Add category
                </Button>
              )}
            </div>

            {isExpanded && (
              <div className="divide-y divide-border">
                {filteredCategories.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-10 text-center">
                    <TypeIcon className={cn("size-8 opacity-30 text-muted-foreground", cfg.color)} />
                    <p className="text-sm text-muted-foreground">No categories yet.</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-1 gap-1.5 text-xs"
                      onClick={() => {
                        const newId = onAddCategory(type);
                        if (newId) {
                          setExpandedCategories((prev) => new Set(prev).add(newId));
                          setEditingCategoryId(newId);
                          setEditDraft("");
                        }
                      }}
                    >
                      <PlusIcon className="size-3.5" /> Add first category
                    </Button>
                  </div>
                ) : (
                  filteredCategories.map((category) => {
                    const allCategoryItems = items.filter((i) => i.categoryId === category.id);
                    const categoryItems = matchingItemsByCategory
                      ? (matchingItemsByCategory.get(category.id) ?? [])
                      : allCategoryItems;

                    const isCategoryExpanded = query ? categoryItems.length > 0 : expandedCategories.has(category.id);
                    const isEditingCategory = editingCategoryId === category.id;
                    const isConfirmingDelete = confirmingDeleteCategoryId === category.id;
                    const isQuickAdding = quickAddCategoryId === category.id;
                    const isCategorySelected = selectedCategoryIds.has(category.id);

                    const allItemsInCategorySelected =
                      allCategoryItems.length > 0 && allCategoryItems.every((i) => selectedItemIds.has(i.id));
                    const someItemsInCategorySelected = allCategoryItems.some((i) => selectedItemIds.has(i.id));

                    return (
                      <Fragment key={category.id}>
                        <div
                          className={cn(
                            "flex items-center gap-3 px-4 py-2.5 transition-colors",
                            isConfirmingDelete ? "bg-destructive/10" : isCategorySelected ? "bg-primary/5" : "hover:bg-muted/30"
                          )}
                        >
                          <input
                            type="checkbox"
                            className={checkboxClass}
                            checked={isCategorySelected}
                            onChange={() => toggleCategorySelection(category.id)}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Select category ${category.name}`}
                          />

                          <button
                            type="button"
                            className="shrink-0 p-0.5 -m-0.5 text-muted-foreground hover:text-foreground"
                            onClick={() => !query && toggleCategory(category.id)}
                            aria-label={isCategoryExpanded ? "Collapse" : "Expand"}
                          >
                            {allCategoryItems.length > 0 ? (
                              isCategoryExpanded
                                ? <ChevronDownIcon className="size-4" />
                                : <ChevronRightIcon className="size-4" />
                            ) : (
                              <span className="inline-block size-4" />
                            )}
                          </button>

                          <div className="flex min-w-0 flex-1 items-center gap-2">
                            {isEditingCategory && !isConfirmingDelete ? (
                              <input
                                value={editDraft}
                                onChange={(e) => setEditDraft(e.target.value)}
                                onBlur={() => commitCategoryEdit(category.id, category.name)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") commitCategoryEdit(category.id, category.name);
                                  if (e.key === "Escape") {
                                    if (!category.name) onDiscardCategory(category.id);
                                    setEditingCategoryId(null);
                                  }
                                }}
                                className={cn(inputClass, "max-w-xs")}
                                autoFocus
                                placeholder="Category name"
                              />
                            ) : (
                              <>
                                <span
                                  className={cn("truncate text-sm font-semibold", !isConfirmingDelete && "cursor-pointer text-foreground/80 hover:text-foreground")}
                                  onClick={() => !isConfirmingDelete && startEditCategory(category)}
                                >
                                  {category.name
                                    ? <Highlight text={category.name} query={query} />
                                    : <span className="italic text-muted-foreground">Unnamed</span>}
                                </span>
                                {allCategoryItems.length > 0 && (
                                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                                    {allCategoryItems.length}
                                  </Badge>
                                )}
                                {isQuickAdding && (
                                  <span className="shrink-0 text-xs text-muted-foreground">
                                    Tab: name → unit → next row · Esc to stop
                                  </span>
                                )}
                              </>
                            )}
                          </div>

                          <div className="flex shrink-0 items-center gap-1">
                            {isConfirmingDelete ? (
                              <>
                                <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={onCancelRemoveCategory}>Cancel</Button>
                                <Button type="button" variant="destructive" size="sm" className="h-7 text-xs" onClick={onConfirmRemoveCategory}>Delete</Button>
                              </>
                            ) : (
                              <>
                                {!isEditingCategory && category.name.trim() && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
                                    onClick={() => startQuickAdd(category.id)}
                                    title="Add items — press Tab after each name to add the next row"
                                  >
                                    <PlusIcon className="size-3" /> Add item
                                  </Button>
                                )}
                                {!isEditingCategory && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-7 text-muted-foreground hover:text-foreground"
                                    onClick={() => startEditCategory(category)}
                                    aria-label="Edit category"
                                  >
                                    <PencilIcon className="size-3.5" />
                                  </Button>
                                )}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="size-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() => onRequestRemoveCategory(category.id)}
                                  aria-label="Delete category"
                                >
                                  <Trash2Icon className="size-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        {isCategoryExpanded && categoryItems.length > 0 && (
                          <div className="border-t border-border bg-muted/20">
                            <Table>
                              <TableHeader>
                                <TableRow className="hover:bg-transparent border-border/60">
                                  <TableHead className="w-10 py-1.5 pl-14 pr-0">
                                    <input
                                      type="checkbox"
                                      className={checkboxClass}
                                      checked={allItemsInCategorySelected}
                                      ref={(el) => {
                                        if (el) el.indeterminate = someItemsInCategorySelected && !allItemsInCategorySelected;
                                      }}
                                      onChange={() => toggleAllItemsInCategory(category.id, allCategoryItems)}
                                      aria-label="Select all items in category"
                                    />
                                  </TableHead>
                                  <TableHead className="py-1.5 text-xs font-semibold uppercase tracking-wide">Name</TableHead>
                                  <TableHead className="w-36 py-1.5 text-xs font-semibold uppercase tracking-wide">Unit</TableHead>
                                  <TableHead className="w-36 py-1.5 text-xs font-semibold uppercase tracking-wide">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {categoryItems.map((item) => {
                                  const isEditingItem = editingItemId === item.id;
                                  const isConfirmingItemDelete = confirmingDeleteItemId === item.id;
                                  const isMoving = movingItemId === item.id;
                                  const isItemSelected = selectedItemIds.has(item.id);
                                  const canMove = categories.filter((c) => c.id !== item.categoryId && c.name.trim()).length > 0;

                                  const handleRowBlur = (e: React.FocusEvent) => {
                                    const row = e.currentTarget.closest("tr");
                                    setTimeout(() => {
                                      if (committingItemRef.current === item.id) { committingItemRef.current = null; return; }
                                      if (row && !row.contains(document.activeElement)) {
                                        commitItemEdit(item.id, item.name, category.id);
                                      }
                                    }, 0);
                                  };

                                  return (
                                    <TableRow
                                      key={item.id}
                                      className={cn(
                                        "border-border/40",
                                        isConfirmingItemDelete ? "bg-destructive/10" : isItemSelected ? "bg-primary/5" : "hover:bg-muted/30"
                                      )}
                                    >
                                      <TableCell className="w-10 py-2 pl-14 pr-0 align-middle">
                                        <input
                                          type="checkbox"
                                          className={checkboxClass}
                                          checked={isItemSelected}
                                          onChange={() => toggleItemSelection(item.id)}
                                          onClick={(e) => e.stopPropagation()}
                                          aria-label={`Select ${item.name}`}
                                        />
                                      </TableCell>

                                      <TableCell className="py-2 align-middle">
                                        {isMoving ? (
                                          <MoveItemSelect
                                            item={item}
                                            categories={categories}
                                            allTypes={allTypes}
                                            onMove={(catId, t) => handleMoveItem(item.id, catId, t)}
                                            onClose={() => setMovingItemId(null)}
                                          />
                                        ) : isEditingItem && !isConfirmingItemDelete ? (
                                          <input
                                            value={editDraft}
                                            onChange={(e) => setEditDraft(e.target.value)}
                                            onBlur={handleRowBlur}
                                            onKeyDown={(e) => {
                                              if (e.key === "Enter") commitItemEdit(item.id, item.name, category.id, false);
                                              if (e.key === "Escape") {
                                                if (!item.name) onDiscardItem(item.id);
                                                setEditingItemId(null);
                                                setQuickAddCategoryId(null);
                                              }
                                            }}
                                            className={cn(inputClass, "max-w-xs")}
                                            autoFocus
                                            placeholder="Item name"
                                          />
                                        ) : (
                                          <span
                                            className={cn("text-sm font-normal text-muted-foreground", !isConfirmingItemDelete && "cursor-pointer hover:text-foreground")}
                                            onClick={() => !isConfirmingItemDelete && startEditItem(item)}
                                          >
                                            {item.name
                                              ? <Highlight text={item.name} query={query} />
                                              : <span className="italic">—</span>}
                                          </span>
                                        )}
                                      </TableCell>

                                      <TableCell className="py-2 align-middle">
                                        {isConfirmingItemDelete ? (
                                          <span className="text-sm text-muted-foreground">{item.unitOfMeasure ?? "—"}</span>
                                        ) : isEditingItem && !isMoving ? (
                                          <select
                                            value={item.unitOfMeasure ?? ""}
                                            onChange={(e) => onUpdateItem(item.id, { unitOfMeasure: e.target.value || undefined })}
                                            onBlur={handleRowBlur}
                                            onKeyDown={(e) => {
                                              if (e.key === "Tab") { e.preventDefault(); commitItemEdit(item.id, item.name, category.id, true); }
                                              if (e.key === "Escape") { setEditingItemId(null); setQuickAddCategoryId(null); }
                                            }}
                                            className={cn(inputClass, "cursor-pointer")}
                                          >
                                            <option value="">—</option>
                                            {units.map((u) => <option key={u} value={u}>{u}</option>)}
                                          </select>
                                        ) : (
                                          <span className="cursor-pointer" onClick={() => !isConfirmingItemDelete && startEditItem(item)}>
                                            {item.unitOfMeasure
                                              ? <Badge variant="secondary" className="text-xs font-normal">{item.unitOfMeasure}</Badge>
                                              : <span className="text-sm text-muted-foreground">—</span>}
                                          </span>
                                        )}
                                      </TableCell>

                                      <TableCell className="py-2 align-middle" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center gap-1">
                                          {isConfirmingItemDelete ? (
                                            <>
                                              <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={onCancelRemoveItem}>Cancel</Button>
                                              <Button type="button" variant="destructive" size="sm" className="h-7 text-xs" onClick={onConfirmRemoveItem}>Delete</Button>
                                            </>
                                          ) : (
                                            <>
                                              {!isEditingItem && !isMoving && (
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="icon"
                                                  className="size-7 text-muted-foreground hover:text-foreground"
                                                  onClick={() => onViewInsights(item.id)}
                                                  aria-label="View cost insights"
                                                  title="View cost insights"
                                                >
                                                  <LineChartIcon className="size-3.5" />
                                                </Button>
                                              )}
                                              {!isEditingItem && !isMoving && (
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="icon"
                                                  className="size-7 text-muted-foreground hover:text-foreground"
                                                  onClick={() => startEditItem(item)}
                                                  aria-label="Edit item"
                                                >
                                                  <PencilIcon className="size-3.5" />
                                                </Button>
                                              )}
                                              {!isMoving && !isEditingItem && canMove && (
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="icon"
                                                  className="size-7 text-muted-foreground hover:text-foreground"
                                                  title="Move to another category"
                                                  onClick={() => { setEditingItemId(null); setMovingItemId(item.id); }}
                                                  aria-label="Move item"
                                                >
                                                  <MoveRightIcon className="size-3.5" />
                                                </Button>
                                              )}
                                              {!isMoving && (
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="icon"
                                                  className="size-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                  onClick={() => onRequestRemoveItem(item.id)}
                                                  aria-label="Delete item"
                                                >
                                                  <Trash2Icon className="size-3.5" />
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
                        )}
                      </Fragment>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })}

      {query && allTypes.every((type: string) => {
        const { filteredCategories } = getFilteredData(categories.filter((c) => c.type === type));
        return filteredCategories.length === 0;
      }) && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-background py-12 text-center">
          <SearchIcon className="size-8 text-muted-foreground/40" />
          <p className="text-sm font-medium text-foreground">No results for "{search}"</p>
          <p className="text-xs text-muted-foreground">Try a different search term.</p>
          <Button type="button" variant="outline" size="sm" className="mt-2 text-xs" onClick={() => setSearch("")}>
            Clear search
          </Button>
        </div>
      )}
    </div>
  );
}
