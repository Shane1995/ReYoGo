import { useState, useEffect, useCallback } from 'react';
import { Button, cn } from '@reyogo/ui';
import { SectionHeader } from '../SectionHeader';

type Tab = 'items' | 'categories' | 'units';

type ManagedRow = {
  id: string;
  name: string;
  usageCount: number;
  archived: boolean;
};

const ipcInvoke = window.electronAPI.ipcRenderer.invoke;

function UsageBadge({ count }: { count: number }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
        count === 0 ? 'bg-muted text-muted-foreground' : 'bg-amber-500/10 text-amber-600',
      )}
    >
      {count === 0 ? 'unused' : `${count} use${count === 1 ? '' : 's'}`}
    </span>
  );
}

function ManageTable({
  rows,
  showArchived,
  onToggleArchived,
  onArchive,
  onRestore,
  onDelete,
}: {
  rows: ManagedRow[];
  showArchived: boolean;
  onToggleArchived: () => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const active = rows.filter((r) => !r.archived);
  const archived = rows.filter((r) => r.archived);
  const visible = showArchived ? [...active, ...archived] : active;

  if (visible.length === 0 && !showArchived) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        Nothing here yet.
        {archived.length > 0 && (
          <button
            type="button"
            onClick={onToggleArchived}
            className="ml-2 text-[var(--nav-active-border)] hover:underline"
          >
            Show {archived.length} archived
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {archived.length > 0 && (
        <div className="flex justify-end pb-1">
          <button
            type="button"
            onClick={onToggleArchived}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showArchived ? 'Hide archived' : `Show ${archived.length} archived`}
          </button>
        </div>
      )}
      <div className="rounded-lg border border-[var(--nav-border)] divide-y divide-[var(--nav-border)] overflow-hidden">
        {visible.map((row) => (
          <div
            key={row.id}
            className={cn(
              'flex items-center justify-between gap-3 px-4 py-2.5',
              row.archived && 'opacity-50',
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={cn(
                  'text-sm font-medium text-foreground truncate',
                  row.archived && 'line-through text-muted-foreground',
                )}
              >
                {row.name}
              </span>
              <UsageBadge count={row.usageCount} />
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {row.archived ? (
                <Button type="button" variant="outline" size="sm" onClick={() => onRestore(row.id)}>
                  Restore
                </Button>
              ) : row.usageCount === 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => onDelete(row.id)}
                >
                  Delete
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => onArchive(row.id)}
                  title="This has history — archive instead of delete to preserve records"
                >
                  Archive
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ManageSection() {
  const [tab, setTab] = useState<Tab>('items');
  const [showArchived, setShowArchived] = useState(false);
  const [itemRows, setItemRows] = useState<ManagedRow[]>([]);
  const [catRows, setCatRows] = useState<ManagedRow[]>([]);
  const [unitRows, setUnitRows] = useState<ManagedRow[]>([]);
  const [loading, setLoading] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const [active, archived] = await Promise.all([
        ipcInvoke('inventory:get-items'),
        ipcInvoke('inventory:get-archived-items'),
      ]);
      const all = [...active, ...archived];
      const counts = await Promise.all(
        all.map((i) => ipcInvoke('inventory:get-item-usage-count', i.id)),
      );
      setItemRows(
        all.map((item, idx) => ({
          id: item.id,
          name: item.name,
          usageCount: counts[idx] ?? 0,
          archived: idx >= active.length,
        })),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const [active, archived] = await Promise.all([
        ipcInvoke('inventory:get-categories'),
        ipcInvoke('inventory:get-archived-categories'),
      ]);
      const all = [...active, ...archived];
      const counts = await Promise.all(
        all.map((c) => ipcInvoke('inventory:get-category-usage-count', c.id)),
      );
      setCatRows(
        all.map((cat, idx) => ({
          id: cat.id,
          name: cat.name,
          usageCount: counts[idx] ?? 0,
          archived: idx >= active.length,
        })),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUnits = useCallback(async () => {
    setLoading(true);
    try {
      const [active, archived] = await Promise.all([
        ipcInvoke('setup:get-units'),
        ipcInvoke('setup:get-archived-units'),
      ]);
      const all = [...active, ...archived];
      const counts = await Promise.all(
        all.map((u) => ipcInvoke('setup:get-unit-usage-count', u.id)),
      );
      setUnitRows(
        all.map((unit, idx) => ({
          id: unit.id,
          name: unit.name,
          usageCount: counts[idx] ?? 0,
          archived: idx >= active.length,
        })),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'items') loadItems();
    else if (tab === 'categories') loadCategories();
    else loadUnits();
  }, [tab, loadItems, loadCategories, loadUnits]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'items', label: 'Items' },
    { key: 'categories', label: 'Categories' },
    { key: 'units', label: 'Units' },
  ];

  const rows = tab === 'items' ? itemRows : tab === 'categories' ? catRows : unitRows;

  const reload = useCallback(() => {
    if (tab === 'items') loadItems();
    else if (tab === 'categories') loadCategories();
    else loadUnits();
  }, [tab, loadItems, loadCategories, loadUnits]);

  const handleArchive = useCallback(
    async (id: string) => {
      if (tab === 'items') await ipcInvoke('inventory:archive-item', id);
      else if (tab === 'categories') await ipcInvoke('inventory:archive-category', id);
      else await ipcInvoke('setup:archive-unit', id);
      reload();
    },
    [tab, reload],
  );

  const handleRestore = useCallback(
    async (id: string) => {
      if (tab === 'items') await ipcInvoke('inventory:restore-item', id);
      else if (tab === 'categories') await ipcInvoke('inventory:restore-category', id);
      else await ipcInvoke('setup:restore-unit', id);
      reload();
    },
    [tab, reload],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (tab === 'items') await ipcInvoke('inventory:hard-delete-item', id);
      else if (tab === 'categories') await ipcInvoke('inventory:hard-delete-category', id);
      else await ipcInvoke('setup:hard-delete-unit', id);
      reload();
    },
    [tab, reload],
  );

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader label="Manage" />
      <p className="text-sm text-muted-foreground -mt-2">
        Archive items that have history to preserve records, or delete unused ones entirely.
      </p>

      <div className="inline-flex items-center rounded-lg border border-[var(--nav-border)] bg-muted/20 p-0.5 gap-0.5">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-medium transition-all duration-150',
              tab === t.key
                ? 'bg-[var(--nav-active-border)]/15 text-[var(--nav-active-border)] shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground py-4">Loading…</p>
      ) : (
        <ManageTable
          rows={rows}
          showArchived={showArchived}
          onToggleArchived={() => setShowArchived((v) => !v)}
          onArchive={handleArchive}
          onRestore={handleRestore}
          onDelete={handleDelete}
        />
      )}
    </section>
  );
}
