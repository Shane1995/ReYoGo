import { cn } from '@reyogo/ui';
import { fmt } from '../../utils/fmt';
import { categoryRowKey } from './utils/categoryRowKey';
import { categoryNameOf } from './utils/categoryNameOf';
import { cogsSharePctOf } from './utils/cogsSharePctOf';
import type { CogsCategoryTableProps } from './types';

export function CogsCategoryTable({ cogs }: CogsCategoryTableProps) {
  if (cogs.byCategory.length === 0) return null;
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary text-xs font-semibold uppercase tracking-wider text-foreground/80">
            <th className="px-4 py-2.5 text-left">Category</th>
            <th className="px-4 py-2.5 text-right">COGS</th>
            <th className="px-4 py-2.5 text-right">% of Total</th>
          </tr>
        </thead>
        <tbody>
          {cogs.byCategory.map((row, i) => (
            <tr key={categoryRowKey(row, i)} className={cn(i % 2 !== 0 && 'bg-black/[0.025]')}>
              <td className="px-4 py-2.5 text-muted-foreground">{categoryNameOf(row)}</td>
              <td className="px-4 py-2.5 text-right font-mono font-medium text-foreground">
                {fmt(row.total)}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                {cogsSharePctOf(row.total, cogs.total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
