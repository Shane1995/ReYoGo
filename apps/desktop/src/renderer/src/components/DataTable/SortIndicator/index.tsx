import { ChevronUpIcon, ChevronDownIcon } from 'lucide-react';
import { cn } from '@reyogo/ui';
import type { SortDir } from '@/hooks/useTableSort';

type Props = {
  active: boolean;
  dir: SortDir;
};

function sortGlyphClass(active: boolean, dir: SortDir, target: 'asc' | 'desc'): string {
  if (active && dir === target) return 'text-[var(--nav-active-border)]';
  return 'opacity-30';
}

export function SortIndicator({ active, dir }: Props) {
  return (
    <span className="ml-1 inline-flex flex-col gap-px shrink-0">
      <ChevronUpIcon className={cn('size-2.5', sortGlyphClass(active, dir, 'asc'))} />
      <ChevronDownIcon className={cn('size-2.5', sortGlyphClass(active, dir, 'desc'))} />
    </span>
  );
}
