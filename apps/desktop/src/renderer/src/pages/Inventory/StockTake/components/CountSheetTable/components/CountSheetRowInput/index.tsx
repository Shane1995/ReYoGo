import { Input } from '@reyogo/ui';
import type { CountSheetRowInputProps } from './types';

export function CountSheetRowInput({ row, readOnly, onQtyChange }: CountSheetRowInputProps) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-border last:border-0">
      <div className="min-w-0">
        <span className="text-sm font-medium text-foreground">{row.itemName}</span>
        {row.uom && <span className="ml-2 text-xs text-muted-foreground">{row.uom}</span>}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-muted-foreground w-16 text-right">
          {row.lastCost === null ? '—' : row.lastCost}
        </span>
        <Input
          type="number"
          value={row.countedQty ?? ''}
          disabled={readOnly}
          className="h-8 w-24 text-sm text-right"
          onChange={(e) => {
            const value = e.target.value;
            onQtyChange(row.itemId, value === '' ? null : Number(value));
          }}
        />
      </div>
    </div>
  );
}
