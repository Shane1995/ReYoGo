import { ChevronUpIcon, ChevronDownIcon } from 'lucide-react';
import { cn } from '@reyogo/ui';
import { sortGlyphClass } from './utils/sortGlyphClass';
import type { SortIndicatorProps } from './types';

export function SortIndicator({ active, dir }: SortIndicatorProps) {
  return (
    <span className="ml-1 inline-flex flex-col gap-px shrink-0">
      <ChevronUpIcon className={cn('size-2.5', sortGlyphClass(active, dir, 'asc'))} />
      <ChevronDownIcon className={cn('size-2.5', sortGlyphClass(active, dir, 'desc'))} />
    </span>
  );
}
