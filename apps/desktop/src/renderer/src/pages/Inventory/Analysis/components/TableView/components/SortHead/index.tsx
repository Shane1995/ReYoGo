import { Button, cn } from '@reyogo/ui';
import { TableHead } from '@reyogo/ui';
import { SortIndicator } from '@/components/DataTable/SortIndicator';
import type { SortHeadProps } from './types';

export function SortHead({ sortKey, activeKey, dir, label, className, onToggle }: SortHeadProps) {
  const isActive = activeKey === sortKey;
  return (
    <TableHead
      className={cn(
        'text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 py-2.5',
        className,
      )}
    >
      <Button
        variant="ghost"
        size="sm"
        className="-mx-2 h-auto py-0 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 hover:text-foreground hover:bg-transparent gap-0"
        onClick={() => onToggle(sortKey)}
      >
        {label}
        <SortIndicator active={isActive} dir={isActive ? dir : null} />
      </Button>
    </TableHead>
  );
}
