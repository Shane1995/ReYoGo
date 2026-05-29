import { useEffect, useState, useCallback } from 'react';
import { ArchiveRestoreIcon } from 'lucide-react';
import { PageHeader, Badge } from '@reyogo/ui';
import { DataTable } from '@/components/DataTable';
import type { ColumnDef } from '@/components/DataTable';
import { useEntities } from '@/Context/EntityContext';

const ipcInvoke = window.electronAPI.ipcRenderer.invoke;

const ENTITY_COLORS = [
  { bg: 'rgba(32,201,151,0.12)', fg: '#0D6E4F' },
  { bg: 'rgba(14,165,233,0.12)', fg: '#0369A1' },
  { bg: 'rgba(253,126,20,0.12)', fg: '#9A3412' },
  { bg: 'rgba(168,85,247,0.12)', fg: '#6B21A8' },
  { bg: 'rgba(236,72,153,0.12)', fg: '#9D174D' },
] as const;

type ArchivedItem = {
  id: string;
  entityId: string;
  name: string;
  categoryName: string;
  unitOfMeasure?: string;
};

export default function ManagePage() {
  const { entities } = useEntities();
  const [itemRows, setItemRows] = useState<ArchivedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const entityIndexMap = new Map(entities.map((e, i) => [e.id, i]));

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const [archivedItems, categories, units] = await Promise.all([
        ipcInvoke('inventory:get-archived-items'),
        ipcInvoke('inventory:get-categories'),
        ipcInvoke('setup:get-units'),
      ]);
      const catMap = new Map(categories.map((c) => [c.id, c.name]));
      const unitMap = new Map(units.map((u) => [u.id, u.name]));
      setItemRows(
        archivedItems.map((item) => ({
          id: item.id,
          entityId: item.entityId,
          name: item.name,
          categoryName: catMap.get(item.categoryId) ?? '—',
          unitOfMeasure: item.unitOfMeasureId ? unitMap.get(item.unitOfMeasureId) : undefined,
        })),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleUnarchiveItem = useCallback(
    async (id: string) => {
      await ipcInvoke('inventory:restore-item', id);
      loadItems();
    },
    [loadItems],
  );

  const itemColumns: ColumnDef<ArchivedItem>[] = [
    {
      key: 'name',
      header: 'Item',
      cell: (row) => (
        <span className="font-medium text-foreground/60 line-through">{row.name}</span>
      ),
    },
    ...(entities.length > 1
      ? [
          {
            key: 'entity' as const,
            header: 'Venue',
            width: '140px',
            cell: (row: ArchivedItem) => {
              const idx = entityIndexMap.get(row.entityId) ?? 0;
              const color = ENTITY_COLORS[idx % ENTITY_COLORS.length]!;
              const name = entities.find((e) => e.id === row.entityId)?.name ?? '—';
              return (
                <span
                  className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium whitespace-nowrap opacity-60"
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
      key: 'category',
      header: 'Category',
      cell: (row) => <span className="text-muted-foreground/60 text-sm">{row.categoryName}</span>,
    },
    {
      key: 'unit',
      header: 'Unit',
      cell: (row) =>
        row.unitOfMeasure ? (
          <Badge variant="secondary" className="text-[11px] font-normal opacity-60">
            {row.unitOfMeasure}
          </Badge>
        ) : (
          <span className="text-muted-foreground/30">—</span>
        ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: '110px',
      cell: (row) => (
        <button
          type="button"
          onClick={() => handleUnarchiveItem(row.id)}
          className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-[var(--nav-active-border)] hover:bg-[var(--nav-active-border)]/10 transition-colors"
        >
          <ArchiveRestoreIcon className="size-3" />
          Unarchive
        </button>
      ),
    },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader title="Archived" />
      <div className="min-h-0 flex-1 overflow-auto">
        <div className="mx-4 my-4">
          {loading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>
          ) : (
            <DataTable
              columns={itemColumns}
              data={itemRows}
              hideFilters
              rowKey={(row) => row.id}
              emptyMessage="No archived items."
            />
          )}
        </div>
      </div>
    </div>
  );
}
