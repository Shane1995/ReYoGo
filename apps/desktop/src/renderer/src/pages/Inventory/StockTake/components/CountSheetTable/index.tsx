import { formatZAR } from '@/utils/format';
import { CountSheetRowInput } from './components/CountSheetRowInput';
import { categorySummaryOf } from './utils/categorySummaryOf';
import type { CountSheetTableProps } from './types';

export function CountSheetTable({ buckets, readOnly, onQtyChange }: CountSheetTableProps) {
  if (buckets.length === 0) {
    return <p className="px-4 py-3 text-sm text-muted-foreground">No items to count</p>;
  }

  return (
    <div>
      <div className="grid grid-cols-[1fr_6rem_6rem_7rem] gap-3 border-b border-border bg-muted/60 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <span>Item</span>
        <span className="text-right">Last cost</span>
        <span className="text-right">Counted qty</span>
        <span className="text-right">Value</span>
      </div>
      {buckets.map((bucket) => {
        const summary = categorySummaryOf(bucket.rows);
        return (
          <div key={bucket.category}>
            <div className="flex items-baseline justify-between gap-3 border-b border-border bg-muted/40 px-4 py-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {bucket.category}
              </span>
              <span className="text-xs text-muted-foreground">
                {summary.countedCount} / {summary.totalCount} counted
                <span className="ml-3 font-medium text-foreground">{formatZAR(summary.value)}</span>
              </span>
            </div>
            {bucket.rows.map((row) => (
              <CountSheetRowInput
                key={row.itemId}
                row={row}
                readOnly={readOnly}
                onQtyChange={onQtyChange}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
