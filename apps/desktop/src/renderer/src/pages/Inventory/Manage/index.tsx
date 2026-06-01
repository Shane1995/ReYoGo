import { useEffect, useState, useCallback } from 'react';
import { ArchiveRestoreIcon } from 'lucide-react';
import { PageHeader, Badge } from '@reyogo/ui';
import { DataTable } from '@/components/DataTable';
import type { ColumnDef } from '@/components/DataTable';

const ipcInvoke = window.electronAPI.ipcRenderer.invoke;

type ArchivedItem = {
  id: string;
  name: string;
  categoryName: string;
  unitOfMeasure?: string;
};

const sortByName = (a: ArchivedItem, b: ArchivedItem) => a.name.localeCompare(b.name);
const sortByCategory = (a: ArchivedItem, b: ArchivedItem) =>
  a.categoryName.localeCompare(b.categoryName);

export default function ManagePage() {
  const [itemRows, setItemRows] = useState<ArchivedItem[]>([]);
  const [loading, setLoading] = useState(true);

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
      sortable: true,
      sortFn: sortByName,
      cell: (row) => (
        <span className="font-medium text-foreground/60 line-through">{row.name}</span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      sortFn: sortByCategory,
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
