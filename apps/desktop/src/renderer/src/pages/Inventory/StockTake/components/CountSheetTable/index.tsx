import { CountSheetRowInput } from './components/CountSheetRowInput';
import type { CountSheetTableProps } from './types';

export function CountSheetTable({ buckets, readOnly, onQtyChange }: CountSheetTableProps) {
  if (buckets.length === 0) {
    return <p className="px-4 py-3 text-sm text-muted-foreground">No items to count</p>;
  }

  return (
    <div>
      {buckets.map((bucket) => (
        <div key={bucket.category}>
          <div className="px-4 py-2 bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {bucket.category}
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
      ))}
    </div>
  );
}
