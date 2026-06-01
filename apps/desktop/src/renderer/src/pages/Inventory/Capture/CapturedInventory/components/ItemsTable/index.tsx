import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, cn } from '@reyogo/ui';
import { VatMode } from '@reyogo/types';
import { DataTable } from '@/components/DataTable';
import type { ColumnDef } from '@/components/DataTable';
import { Checkbox } from '@/components/Checkbox';
import { getTypeConfig } from '../../utils/typeConfig';
import { EditItemDialog } from '../EditItemDialog';
import type { InventoryItem } from '../../types';
import { InvoiceRoutes } from '@/components/AppRoutes/routes';
import type { FlatItem, ItemsTableProps } from './types';
import { useItemSelection } from './hooks/useItemSelection';
import { SelectionBar } from './SelectionBar';
import { ItemRowActions } from './ItemRowActions';

const sortByName = (a: FlatItem, b: FlatItem) => a.name.localeCompare(b.name);
const sortByCategory = (a: FlatItem, b: FlatItem) => a.categoryName.localeCompare(b.categoryName);
const sortByStock = (a: FlatItem, b: FlatItem) => {
  if (a.currentStock == null && b.currentStock == null) return 0;
  if (a.currentStock == null) return 1;
  if (b.currentStock == null) return -1;
  return a.currentStock - b.currentStock;
};
const sortByLastCost = (a: FlatItem, b: FlatItem) => {
  if (a.lastCostPerUnit == null && b.lastCostPerUnit == null) return 0;
  if (a.lastCostPerUnit == null) return 1;
  if (b.lastCostPerUnit == null) return -1;
  return a.lastCostPerUnit - b.lastCostPerUnit;
};
const sortByAvgCost = (a: FlatItem, b: FlatItem) => {
  if (a.weightedAvgCost == null && b.weightedAvgCost == null) return 0;
  if (a.weightedAvgCost == null) return 1;
  if (b.weightedAvgCost == null) return -1;
  return a.weightedAvgCost - b.weightedAvgCost;
};

export function ItemsTable({
  items,
  filteredItems,
  allTypes,
  categories,
  units,
  onUpdate,
  onDelete,
  onViewInsights,
}: ItemsTableProps) {
  const navigate = useNavigate();
  const [editingItem, setEditingItem] = useState<InventoryItem | null | undefined>(undefined);

  const filteredIds = useMemo(() => filteredItems.map((i) => i.id), [filteredItems]);
  const itemsById = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);

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

  const sortCompareFns = useMemo(
    () => ({
      name: sortByName,
      category: sortByCategory,
      cost: sortByLastCost,
      weightedAvgCost: sortByAvgCost,
      stock: sortByStock,
    }),
    [],
  );

  const handleAddToInvoice = useCallback(() => {
    const templateLines = [...selectedIds].map((itemId) => ({
      id: crypto.randomUUID(),
      itemId,
      quantity: 0,
      vatMode: VatMode.Exclusive,
      vatRate: 15,
      totalVatExclude: 0,
    }));
    navigate(InvoiceRoutes.Base, { state: { templateLines } });
  }, [selectedIds, navigate]);

  const columns = useMemo<ColumnDef<FlatItem>[]>(
    () => [
      {
        key: 'select',
        header: (
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected && !allSelected}
            onChange={toggleAll}
          />
        ),
        width: '40px',
        cell: (row) => {
          const isChecked = selectedIds.has(row.id);
          return (
            <span
              className={cn(
                'transition-opacity',
                isChecked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
              )}
            >
              <Checkbox checked={isChecked} onChange={() => toggleOne(row.id)} />
            </span>
          );
        },
      },
      {
        key: 'name',
        header: 'Item',
        sortable: true,
        sortFn: sortByName,
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
        sortable: true,
        sortFn: sortByCategory,
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
        sortable: true,
        sortFn: sortByLastCost,
        cell: (row) =>
          row.lastCostPerUnit != null ? (
            <span className="font-mono text-xs tabular-nums text-foreground">
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
        sortable: true,
        sortFn: sortByAvgCost,
        cell: (row) =>
          row.weightedAvgCost != null ? (
            <span className="font-mono text-xs tabular-nums text-foreground">
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
        sortable: true,
        sortFn: sortByStock,
        cell: (row) =>
          row.currentStock !== undefined ? (
            <span className="font-mono text-xs tabular-nums text-foreground">
              {row.currentStock % 1 === 0
                ? row.currentStock.toFixed(0)
                : row.currentStock.toFixed(2)}
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
        cell: (row) => {
          const original = itemsById.get(row.id);
          if (!original) return null;
          return (
            <ItemRowActions
              row={row}
              originalItem={original}
              onEdit={setEditingItem}
              onViewInsights={onViewInsights}
              onDelete={onDelete}
            />
          );
        },
      },
    ],
    [
      selectedIds,
      allSelected,
      someSelected,
      toggleAll,
      toggleOne,
      itemsById,
      allTypes,
      onViewInsights,
      onDelete,
    ],
  );

  return (
    <>
      {selectedIds.size > 0 && (
        <SelectionBar
          selectedCount={selectedIds.size}
          confirmBulkDelete={confirmBulkDelete}
          onAddToInvoice={handleAddToInvoice}
          onRequestDelete={() => setConfirmBulkDelete(true)}
          onConfirmDelete={handleBulkDelete}
          onCancelDelete={() => setConfirmBulkDelete(false)}
          onClear={clearSelection}
        />
      )}
      <DataTable
        columns={columns}
        data={filteredItems}
        compareFns={sortCompareFns}
        hideFilters
        rowKey={(row) => row.id}
        emptyMessage="No items match your filters."
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
