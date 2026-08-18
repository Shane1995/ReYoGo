import { Input, cn } from '@reyogo/ui';
import { formatZAR } from '@/utils/format';
import type { CountSheetRowInputProps } from './types';

export function CountSheetRowInput({ row, readOnly, onQtyChange }: CountSheetRowInputProps) {
  const isCounted = row.countedQty !== null;

  return (
    <div
      className={cn(
        'grid grid-cols-[1fr_6rem_6rem_7rem] items-center gap-3 border-b border-border px-4 py-2.5 last:border-0',
        isCounted ? 'bg-emerald-50/60 dark:bg-emerald-950/20' : 'bg-transparent',
      )}
    >
      <div className="min-w-0 flex items-center gap-2">
        <span
          className={cn(
            'h-1.5 w-1.5 shrink-0 rounded-full',
            isCounted ? 'bg-emerald-500' : 'bg-border',
          )}
          aria-hidden
        />
        <span className="truncate text-sm font-medium text-foreground">{row.itemName}</span>
        {row.uom && <span className="shrink-0 text-xs text-muted-foreground">{row.uom}</span>}
      </div>
      <span className="text-right text-sm tabular-nums text-muted-foreground">
        {row.lastCost === null ? '—' : formatZAR(row.lastCost)}
      </span>
      <Input
        type="number"
        value={row.countedQty ?? ''}
        disabled={readOnly}
        placeholder="0"
        className="h-8 text-right text-sm tabular-nums"
        onChange={(e) => {
          const value = e.target.value;
          onQtyChange(row.itemId, value === '' ? null : Number(value));
        }}
      />
      <span
        className={cn(
          'text-right text-sm font-semibold tabular-nums',
          isCounted ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        {row.lineValue === null ? '—' : formatZAR(row.lineValue)}
      </span>
    </div>
  );
}
