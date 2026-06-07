import { ChevronRightIcon } from 'lucide-react';
import { cn, TableCell, TableRow } from '@reyogo/ui';
import { InsightChips } from '../../InsightChips';
import { groupStats } from '../../../utils/stats';
import type { ItemGroup } from '../../../types';

type Props = {
  catName: string;
  catGroups: ItemGroup[];
  isExpanded: boolean;
  onToggle: () => void;
};

export function AnalysisCategoryRow({ catName, catGroups, isExpanded, onToggle }: Props) {
  const stats = groupStats(catGroups);
  return (
    <TableRow
      className="cursor-pointer select-none border-[var(--nav-border)] hover:bg-muted/20 transition-colors"
      onClick={onToggle}
    >
      <TableCell colSpan={7} className="relative py-0">
        <div className="absolute inset-y-0 left-0 w-0.5 bg-[var(--nav-active-border)]/20" />
        <div className="flex items-center justify-between pl-5 pr-4 py-2.5">
          <div className="flex items-center gap-2">
            <ChevronRightIcon
              className={cn(
                'size-3.5 text-muted-foreground/30 transition-transform',
                isExpanded && 'rotate-90 text-primary',
              )}
            />
            <span className="text-sm font-medium text-foreground/70">
              {catName || 'Uncategorised'}
            </span>
          </div>
          <InsightChips stats={stats} />
        </div>
      </TableCell>
    </TableRow>
  );
}
