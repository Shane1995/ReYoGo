import { Button, cn } from '@reyogo/ui';
import { TableHead } from '@reyogo/ui';
import { SortIndicator } from '@/components/DataTable/SortIndicator';
import type { SortDir } from '@/hooks/useTableSort';

type Props = {
  sortKey: string;
  label: string;
  activeKey: string | null;
  activeDir: SortDir;
  onToggle: (key: string) => void;
  className?: string;
};

export function SortableHead({ sortKey, label, activeKey, activeDir, onToggle, className }: Props) {
  const isActive = activeKey === sortKey;
  return (
    <TableHead
      className={cn(
        'text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70',
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
        <SortIndicator active={isActive} dir={isActive ? activeDir : null} />
      </Button>
    </TableHead>
  );
}
