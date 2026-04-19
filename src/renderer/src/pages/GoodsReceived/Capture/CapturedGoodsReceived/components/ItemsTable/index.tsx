import { useMemo, useState } from "react";
import { PencilIcon, Trash2Icon, LineChartIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
    return flatItems.filter((item) => {
      const search = filterValues.search?.toLowerCase() ?? "";
      const type = filterValues.type ?? "";
      const category = filterValues.category ?? "";
      if (search && !item.name.toLowerCase().includes(search)) return false;
      if (type && item.type !== type) return false;
      if (category && item.categoryId !== category) return false;
      if (filterValues.unit && item.unitOfMeasure !== filterValues.unit) return false;
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
      options: categoryOptions,
    },
    {
      key: "unit",
      label: "Units",
      type: "select",
      options: unitOptions,
    },
  ];

  const columns: ColumnDef<FlatItem>[] = [
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
      <DataTable
        columns={columns}
        data={filteredItems}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={(key, value) =>
          setFilterValues((prev) => ({ ...prev, [key]: value }))
        }
        onClearFilters={() => setFilterValues({})}
        rowKey={(row) => row.id}
        emptyMessage={
          Object.values(filterValues).some(Boolean)
            ? "No items match your filters."
            : "No items yet. Add your first item above."
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
