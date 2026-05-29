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
import { useItemSelection } from './hooks/useItemSelection';
import { SelectionBar } from './SelectionBar';
import { ItemRowActions } from './ItemRowActions';
import { useEntities } from '@/Context/EntityContext';

const ENTITY_COLORS = [
  { bg: 'rgba(32,201,151,0.12)', fg: '#0D6E4F' },
  { bg: 'rgba(14,165,233,0.12)', fg: '#0369A1' },
  { bg: 'rgba(253,126,20,0.12)', fg: '#9A3412' },
  { bg: 'rgba(168,85,247,0.12)', fg: '#6B21A8' },
  { bg: 'rgba(236,72,153,0.12)', fg: '#9D174D' },
] as const;

export function ItemsTable({
  items,
  filteredItems,
  allTypes,
  categories,
  units,
  entityFilter,
  onUpdate,
  onDelete,
  onViewInsights,
}: ItemsTableProps) {
  const navigate = useNavigate();
  const { entities } = useEntities();
  const [editingItem, setEditingItem] = useState<InventoryItem | null | undefined>(undefined);

  const entityIndexMap = useMemo(() => new Map(entities.map((e, i) => [e.id, i])), [entities]);

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
    ...(entityFilter === null
      ? [
          {
            key: 'entity' as const,
            header: 'Venue',
            cell: (row: FlatItem) => {
              const idx = entityIndexMap.get(row.entityId) ?? 0;
              const color = ENTITY_COLORS[idx % ENTITY_COLORS.length]!;
              const name = entities.find((e) => e.id === row.entityId)?.name ?? '—';
              return (
                <span
                  className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium"
                  style={{ background: color.bg, color: color.fg }}
                >
                  {name}
                </span>
              );
            },
          },
        ]
      : []),
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
      cell: (row) =>
        row.currentStock !== undefined ? (
          <span className="font-mono text-xs tabular-nums text-foreground">
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
