import { ChevronUpIcon, ChevronDownIcon } from 'lucide-react';
import { cn } from '@reyogo/ui';
import type { SortDir } from '@/hooks/useTableSort';

type Props = {
  active: boolean;
  dir: SortDir;
};

export function SortIndicator({ active, dir }: Props) {
  return (
    <span className="ml-1 inline-flex flex-col gap-px shrink-0">
      <ChevronUpIcon
        className={cn(
          'size-2.5',
          active && dir === 'asc' ? 'text-[var(--nav-active-border)]' : 'opacity-30',
        )}
      />
      <ChevronDownIcon
        className={cn(
          'size-2.5',
          active && dir === 'desc' ? 'text-[var(--nav-active-border)]' : 'opacity-30',
        )}
      />
    </span>
  );
}
