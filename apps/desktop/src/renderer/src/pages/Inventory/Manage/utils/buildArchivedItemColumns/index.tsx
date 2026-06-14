import { ArchiveRestoreIcon } from 'lucide-react';
import { Badge } from '@reyogo/ui';
import type { ColumnDef } from '@/components/DataTable';
import type { ArchivedItem } from '../../types';
import { sortByName } from '../sortByName';
import { sortByCategory } from '../sortByCategory';

export function buildArchivedItemColumns(
  onUnarchive: (id: string) => void,
): ColumnDef<ArchivedItem>[] {
  return [
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
          onClick={() => onUnarchive(row.id)}
          className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-[var(--nav-active-border)] hover:bg-[var(--nav-active-border)]/10 transition-colors"
        >
          <ArchiveRestoreIcon className="size-3" />
          Unarchive
        </button>
      ),
    },
  ];
}
