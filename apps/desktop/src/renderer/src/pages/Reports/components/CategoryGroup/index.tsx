import { ChevronRightIcon } from 'lucide-react';
import { chevronClassName } from '@/pages/Inventory/Analysis/components/TableView/components/GroupRow/utils/chevronClassName';
import { itemCountLabelOf } from './utils/itemCountLabelOf';
import type { CategoryGroupProps } from './types';

export function CategoryGroup({
  category,
  count,
  summary,
  isExpanded,
  onToggle,
  children,
}: CategoryGroupProps) {
  return (
    <div className="rounded-lg border border-[var(--nav-border)] overflow-hidden print:border-none print:rounded-none">
      <button
        type="button"
        onClick={() => onToggle(category)}
        className="flex w-full items-center justify-between gap-4 bg-muted px-3 py-2 text-left hover:bg-muted/80 print:bg-white"
      >
        <span className="flex items-center gap-2 font-medium text-foreground">
          <ChevronRightIcon className={chevronClassName(isExpanded)} />
          <span>{category}</span>
          <span className="font-normal text-muted-foreground">{itemCountLabelOf(count)}</span>
        </span>
        {summary !== undefined && (
          <span className="font-mono text-sm tabular-nums text-foreground">{summary}</span>
        )}
      </button>
      {isExpanded && children}
    </div>
  );
}
