import { useMemo, useState } from "react";
import { PencilIcon, Trash2Icon, LineChartIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable";
import type { ColumnDef, FilterField, FilterValues } from "@/components/DataTable";
import { cn } from "@/lib/utils";
import { getTypeConfig } from "../../utils/typeConfig";
import { EditItemDialog } from "../EditItemDialog";
import type { InventoryCategory, InventoryItem } from "../../types";

type ItemCost = { price: number; uom?: string };

type FlatItem = {
  id: string;
  name: string;
  type: string;
  categoryId: string;
  categoryName: string;
  unitOfMeasure?: string;
  lastCostPerUnit?: number;
  lastCostUom?: string;
};

type Props = {
  items: InventoryItem[];
  categories: InventoryCategory[];
  units: string[];
  goodTypes: string[];
  costMap: Map<string, ItemCost>;
  onUpdate: (id: string, values: Omit<InventoryItem, "id">) => void;
  onDelete: (id: string) => void;
  onViewInsights: (id: string) => void;
};

export function ItemsTable({
  items,
  categories,
  units,
  goodTypes,
  costMap,
  onUpdate,
  onDelete,
  onViewInsights,
}: Props) {
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [editingItem, setEditingItem] = useState<InventoryItem | null | undefined>(undefined);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const allTypes = useMemo(() => {
    const fromCategories = categories.map((c) => c.type).filter(Boolean);
    return Array.from(new Set([...goodTypes, ...fromCategories]));
  }, [goodTypes, categories]);

  const flatItems = useMemo<FlatItem[]>(() => {
    return items.map((item) => {
      const category = categories.find((c) => c.id === item.categoryId);
      const cost = costMap.get(item.id);
      return {
        id: item.id,
        name: item.name,
        type: item.type,
        categoryId: item.categoryId,
        categoryName: category?.name ?? "—",
        unitOfMeasure: item.unitOfMeasure,
        lastCostPerUnit: cost?.price,
        lastCostUom: cost?.uom,
      };
    });
  }, [items, categories, costMap]);

  const filteredItems = useMemo(() => {
    const search = (filterValues.search as string)?.toLowerCase() ?? "";
    const type = (filterValues.type as string) ?? "";
    const categories_ = (filterValues.category as string[]) ?? [];
    const units_ = (filterValues.unit as string[]) ?? [];

    return flatItems.filter((item) => {
      if (search && !item.name.toLowerCase().includes(search)) return false;
      if (type && item.type !== type) return false;
      if (categories_.length > 0 && !categories_.includes(item.categoryId)) return false;
      if (units_.length > 0 && !units_.includes(item.unitOfMeasure ?? "")) return false;
      return true;
    });
  }, [flatItems, filterValues]);

  const categoryOptions = useMemo(() => {
    const seen = new Set<string>();
    return categories
      .filter((c) => c.name.trim() && !seen.has(c.id) && seen.add(c.id))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((c) => ({ value: c.id, label: c.name }));
  }, [categories]);

  const unitOptions = useMemo(() => {
    const used = Array.from(new Set(items.map((i) => i.unitOfMeasure).filter(Boolean) as string[])).sort();
    return used.map((u) => ({ value: u, label: u }));
  }, [items]);

  const filters: FilterField[] = [
    { key: "search", label: "Items", type: "search", placeholder: "Search items…" },
    {
      key: "type",
      label: "Good Types",
      type: "select",
      options: allTypes.map((t) => ({ value: t, label: t })),
    },
    {
      key: "category",
      label: "Categories",
      type: "select",
      multi: true,
      options: (values) => {
        const selectedType = values.type as string;
        return categoryOptions.filter((opt) => {
          if (!selectedType) return true;
          const cat = categories.find((c) => c.id === opt.value);
          return cat?.type === selectedType;
        });
      },
    },
    {
      key: "unit",
      label: "Units",
      type: "select",
      multi: true,
      options: unitOptions,
    },
  ];

  const allFilteredIds = useMemo(() => filteredItems.map((i) => i.id), [filteredItems]);
  const allSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedIds.has(id));
  const someSelected = allFilteredIds.some((id) => selectedIds.has(id));

  function toggleAll() {
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        allFilteredIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => new Set([...prev, ...allFilteredIds]));
    }
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleBulkDelete() {
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      await onDelete(id);
    }
    setSelectedIds(new Set());
    setConfirmBulkDelete(false);
  }

  const columns: ColumnDef<FlatItem>[] = [
    {
      key: "select",
      header: (
        <input
          type="checkbox"
          checked={allSelected}
          ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
          onChange={toggleAll}
          className="size-4 cursor-pointer rounded border-border accent-primary [color-scheme:dark]"
          aria-label="Select all"
        />
      ),
      width: "40px",
      cell: (row) => (
        <input
          type="checkbox"
          checked={selectedIds.has(row.id)}
          onChange={() => toggleOne(row.id)}
          className="size-4 cursor-pointer rounded border-border accent-primary [color-scheme:dark]"
          aria-label={`Select ${row.name}`}
        />
      ),
    },
    {
      key: "name",
      header: "Item Name",
      cell: (row) => (
        <span className="font-medium text-foreground">{row.name}</span>
      ),
    },
    {
      key: "type",
      header: "Good Type",
      cell: (row) => {
        const cfg = getTypeConfig(row.type, allTypes);
        return (
          <Badge className={cn("text-xs font-medium", cfg.badgeClass)}>
            {row.type}
          </Badge>
        );
      },
    },
    {
      key: "category",
      header: "Category",
      cell: (row) => (
        <span className="text-muted-foreground">{row.categoryName}</span>
      ),
    },
    {
      key: "unit",
      header: "Unit of Measure",
      cell: (row) =>
        row.unitOfMeasure ? (
          <Badge variant="secondary" className="text-xs font-normal">
            {row.unitOfMeasure}
          </Badge>
        ) : (
          <span className="text-muted-foreground/50">—</span>
        ),
    },
    {
      key: "cost",
      header: "Last Cost / Unit",
      align: "right",
      cell: (row) =>
        row.lastCostPerUnit !== undefined ? (
          <span className="font-mono text-foreground">
            {row.lastCostPerUnit.toFixed(2)}
            {row.lastCostUom ? ` / ${row.lastCostUom}` : ""}
          </span>
        ) : (
          <span className="text-muted-foreground/50">No data</span>
        ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      width: "120px",
      cell: (row) => {
        if (confirmDeleteId === row.id) {
          return (
            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={() => { onDelete(row.id); setConfirmDeleteId(null); }}
                className="rounded px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          );
        }
        const original = items.find((i) => i.id === row.id)!;
        return (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              title="View cost insights"
              onClick={() => onViewInsights(row.id)}
              className="flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <LineChartIcon className="size-3.5" />
            </button>
            <button
              type="button"
              title="Edit item"
              onClick={() => setEditingItem(original)}
              className="flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <PencilIcon className="size-3.5" />
            </button>
            <button
              type="button"
              title="Delete item"
              onClick={() => setConfirmDeleteId(row.id)}
              className="flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <Trash2Icon className="size-3.5" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      {selectedIds.size > 0 && (
        <div className="mb-2 flex items-center gap-3 rounded-lg border border-primary/20 bg-secondary px-3 py-1.5">
          <span className="text-xs font-medium text-secondary-foreground">
            {selectedIds.size} item{selectedIds.size !== 1 ? "s" : ""} selected
          </span>
          <div className="h-3 w-px bg-border" />
          {confirmBulkDelete ? (
            <>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                className="h-7 text-xs"
                onClick={handleBulkDelete}
              >
                Confirm — delete {selectedIds.size}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-muted-foreground hover:text-secondary-foreground"
                onClick={() => setConfirmBulkDelete(false)}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 gap-1.5 text-xs text-primary hover:bg-primary/10 hover:text-primary"
                onClick={() => setConfirmBulkDelete(true)}
              >
                <Trash2Icon className="size-3" />
                Delete selected
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-muted-foreground hover:text-secondary-foreground"
                onClick={() => setSelectedIds(new Set())}
              >
                Clear
              </Button>
            </>
          )}
        </div>
      )}
      <DataTable
        columns={columns}
        data={filteredItems}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={(key, value) =>
          setFilterValues((prev) => {
            const next = { ...prev, [key]: value };
            if (key === "type") {
              const selectedType = value as string;
              const currentCats = (prev.category as string[]) ?? [];
              if (selectedType && currentCats.length > 0) {
                const validCats = currentCats.filter((id) => {
                  const cat = categories.find((c) => c.id === id);
                  return cat?.type === selectedType;
                });
                next.category = validCats;
              }
            }
            return next;
          })
        }
        onClearFilters={() => setFilterValues({})}
        rowKey={(row) => row.id}
        emptyMessage={
          Object.values(filterValues).some((v) => (Array.isArray(v) ? v.length > 0 : Boolean(v)))
            ? "No items match your filters."
            : "No items yet. Use the + button to add your first item."
        }
      />

      {editingItem !== undefined && (
        <EditItemDialog
          item={editingItem}
          categories={categories}
          units={units}
          onSave={(id, values) => {
            if (id) onUpdate(id, values);
            setEditingItem(undefined);
          }}
          onClose={() => setEditingItem(undefined)}
        />
      )}
    </>
  );
}
