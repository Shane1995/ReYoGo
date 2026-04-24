import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@/components/DataTable";
import { cn } from "@/lib/utils";
import { getTypeConfig } from "../../utils/typeConfig";
import { EditItemDialog } from "../EditItemDialog";
import type { InventoryItem } from "../../types";
import { InvoiceRoutes } from "@/components/AppRoutes/routes";
import type { FlatItem, ItemsTableProps } from "./types";
import { useItemFilters } from "./hooks/useItemFilters";
import { useItemSelection } from "./hooks/useItemSelection";
import { SelectionBar } from "./SelectionBar";
import { ItemRowActions } from "./ItemRowActions";

export function ItemsTable({
  items,
  categories,
  units,
  goodTypes,
  costMap,
  stockMap,
  onUpdate,
  onDelete,
  onViewInsights,
}: ItemsTableProps) {
  const navigate = useNavigate();
  const [editingItem, setEditingItem] = useState<InventoryItem | null | undefined>(undefined);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const { filterValues, filteredItems, filters, allTypes, handleFilterChange, clearFilters } =
    useItemFilters({ items, categories, goodTypes, costMap, stockMap });

  const filteredIds = useMemo(() => filteredItems.map((i) => i.id), [filteredItems]);

  const {
    selectedIds,
    confirmBulkDelete,
    setConfirmBulkDelete,
    allSelected,
    someSelected,
    toggleAll,
    toggleOne,
    handleBulkDelete,
    clearSelection,
  } = useItemSelection({ filteredIds, onDelete });

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
      cell: (row) => <span className="font-medium text-foreground">{row.name}</span>,
    },
    {
      key: "type",
      header: "Good Type",
      cell: (row) => {
        const cfg = getTypeConfig(row.type, allTypes);
        return <Badge className={cn("text-xs font-medium", cfg.badgeClass)}>{row.type}</Badge>;
      },
    },
    {
      key: "category",
      header: "Category",
      cell: (row) => <span className="text-muted-foreground">{row.categoryName}</span>,
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
      key: "stock",
      header: "Stock",
      align: "right",
      cell: (row) =>
        row.currentStock !== undefined ? (
          <span className="font-mono text-foreground">
            {row.currentStock % 1 === 0
              ? row.currentStock.toFixed(0)
              : row.currentStock.toFixed(2)}
            {row.unitOfMeasure ? ` ${row.unitOfMeasure}` : ""}
          </span>
        ) : (
          <span className="text-muted-foreground/50">—</span>
        ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      width: "120px",
      cell: (row) => (
        <ItemRowActions
          row={row}
          originalItem={items.find((i) => i.id === row.id)!}
          confirmDeleteId={confirmDeleteId}
          onEdit={setEditingItem}
          onViewInsights={onViewInsights}
          onRequestDelete={setConfirmDeleteId}
          onCancelDelete={() => setConfirmDeleteId(null)}
          onConfirmDelete={(id) => { onDelete(id); setConfirmDeleteId(null); }}
        />
      ),
    },
  ];

  return (
    <>
      {selectedIds.size > 0 && (
        <SelectionBar
          selectedCount={selectedIds.size}
          confirmBulkDelete={confirmBulkDelete}
          onAddToInvoice={() => {
            const templateLines = [...selectedIds].map((itemId) => ({
              id: crypto.randomUUID(),
              itemId,
              quantity: 0,
              vatMode: "exclusive" as const,
              vatRate: 15,
              totalVatExclude: 0,
            }));
            navigate(InvoiceRoutes.Base, { state: { templateLines } });
          }}
          onRequestDelete={() => setConfirmBulkDelete(true)}
          onConfirmDelete={handleBulkDelete}
          onCancelDelete={() => setConfirmBulkDelete(false)}
          onClear={clearSelection}
        />
      )}
      <DataTable
        columns={columns}
        data={filteredItems}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
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
