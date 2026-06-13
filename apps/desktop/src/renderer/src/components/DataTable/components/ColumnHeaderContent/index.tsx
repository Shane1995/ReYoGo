import { Button } from '@reyogo/ui';
import { SortIndicator } from '../../SortIndicator';
import { isSortableColumn } from '../../utils/isSortableColumn';
import type { ColumnHeaderContentProps } from './types';

export function ColumnHeaderContent<T>({
  col,
  sortKey,
  sortDir,
  toggleSort,
}: ColumnHeaderContentProps<T>) {
  if (!isSortableColumn(col)) return <>{col.header}</>;
  const isActive = sortKey === col.key;
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-mx-2 h-auto py-0 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 hover:text-foreground hover:bg-transparent inline-flex items-center"
      onClick={() => toggleSort(col.key)}
    >
      {col.header}
      <SortIndicator active={isActive} dir={isActive ? sortDir : null} />
    </Button>
  );
}
