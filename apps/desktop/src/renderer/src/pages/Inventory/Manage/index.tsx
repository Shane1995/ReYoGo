import { useMemo } from 'react';
import { PageHeader } from '@reyogo/ui';
import { DataTable } from '@/components/DataTable';
import { useArchivedItems } from './hooks/useArchivedItems';
import { buildArchivedItemColumns } from './utils/buildArchivedItemColumns';

export default function ManagePage() {
  const { itemRows, loading, unarchiveItem } = useArchivedItems();

  const itemColumns = useMemo(() => buildArchivedItemColumns(unarchiveItem), [unarchiveItem]);

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
