import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@reyogo/ui';
import { DataTable } from '@/components/DataTable';
import type { ColumnDef } from '@/components/DataTable';
import { cn } from '@reyogo/ui';
import { getTypeConfig } from '../../utils/typeConfig';
import { EditItemDialog } from '../EditItemDialog';
import type { InventoryItem } from '../../types';
import { InvoiceRoutes } from '@/components/AppRoutes/routes';
import type { FlatItem, ItemsTableProps } from './types';
import { useItemFilters } from './hooks/useItemFilters';
import { useItemSelection } from './hooks/useItemSelection';
import { SelectionBar } from './SelectionBar';
import { ItemRowActions } from './ItemRowActions';

export function ItemsTable({
  items,
  categories,
  units,
  costMap,
  stockMap,
  onUpdate,
  onDelete,
  onViewInsights,
}: ItemsTableProps) {
  const navigate = useNavigate();
  const [editingItem, setEditingItem] = useState<InventoryItem | null | undefined>(undefined);

  const { filterValues, filteredItems, filters, allTypes, handleFilterChange, clearFilters } =
    useItemFilters({ items, categories, costMap, stockMap });

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
      key: 'select',
      header: (
        <input
          type="checkbox"
          checked={allSelected}
          ref={(el) => {
            if (el) el.indeterminate = someSelected && !allSelected;
          }}
          onChange={toggleAll}
          className="size-3.5 cursor-pointer rounded border-border accent-primary"
          aria-label="Select all"
        />
      ),
      width: '40px',
      cell: (row) => (
        <input
          type="checkbox"
          checked={selectedIds.has(row.id)}
          onChange={() => toggleOne(row.id)}
          className="size-3.5 cursor-pointer rounded border-border accent-primary"
          aria-label={`Select ${row.name}`}
        />
      ),
    },
    {
      key: 'name',
      header: 'Item',
      cell: (row) => <span className="font-medium text-foreground">{row.name}</span>,
    },
    {
      key: 'type',
      header: 'Type',
      cell: (row) => {
        const cfg = getTypeConfig(row.type, allTypes);
        return (
          <Badge className={cn('text-[11px] font-medium capitalize', cfg.badgeClass)}>
            {row.type}
          </Badge>
        );
      },
    },
    {
      key: 'category',
      header: 'Category',
      cell: (row) => <span className="text-muted-foreground text-sm">{row.categoryName}</span>,
    },
    {
      key: 'unit',
      header: 'Unit',
      cell: (row) =>
        row.unitOfMeasure ? (
          <Badge variant="secondary" className="text-[11px] font-normal">
            {row.unitOfMeasure}
          </Badge>
        ) : (
          <span className="text-muted-foreground/30">—</span>
        ),
    },
    {
      key: 'cost',
      header: 'Last cost / unit',
      align: 'right',
      cell: (row) =>
        row.lastCostPerUnit !== undefined ? (
          <span className="font-mono text-sm tabular-nums text-foreground">
            {row.lastCostPerUnit.toFixed(2)}
            {row.lastCostUom ? (
              <span className="text-muted-foreground/60"> / {row.lastCostUom}</span>
            ) : null}
          </span>
        ) : (
          <span className="text-muted-foreground/30 text-xs">—</span>
        ),
    },
    {
      key: 'weightedAvgCost',
      header: 'Avg cost',
      align: 'right',
      cell: (row) =>
        row.weightedAvgCost != null ? (
          <span className="font-mono text-sm tabular-nums text-foreground">
            {row.weightedAvgCost.toFixed(2)}
            {row.unitOfMeasure ? (
              <span className="text-muted-foreground/60"> / {row.unitOfMeasure}</span>
            ) : null}
          </span>
        ) : (
          <span className="text-muted-foreground/30 text-xs">—</span>
        ),
    },
    {
      key: 'stock',
      header: 'Stock',
      align: 'right',
      cell: (row) =>
        row.currentStock !== undefined ? (
          <span className="font-mono text-sm tabular-nums text-foreground">
            {row.currentStock % 1 === 0 ? row.currentStock.toFixed(0) : row.currentStock.toFixed(2)}
            {row.unitOfMeasure ? (
              <span className="text-muted-foreground/60"> {row.unitOfMeasure}</span>
            ) : null}
          </span>
        ) : (
          <span className="text-muted-foreground/30 text-xs">—</span>
        ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: '48px',
      cell: (row) => (
        <ItemRowActions
          row={row}
          originalItem={items.find((i) => i.id === row.id)!}
          onEdit={setEditingItem}
          onViewInsights={onViewInsights}
          onDelete={onDelete}
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
              vatMode: 'exclusive' as const,
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
            ? 'No items match your filters.'
            : 'No items yet. Use the + button to add your first item.'
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
