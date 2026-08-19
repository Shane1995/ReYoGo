import { Input } from '@reyogo/ui';
import { moneyOrDash } from './utils/moneyOrDash';
import { parseQtyInput } from './utils/parseQtyInput';
import { rowClassName, dotClassName, valueClassName } from './utils/rowClassNames';
import { qtyInputValueOf } from './utils/qtyInputValueOf';
import type { CountSheetRowInputProps } from './types';

export function CountSheetRowInput({ row, readOnly, onQtyChange }: CountSheetRowInputProps) {
  const isCounted = row.countedQty !== null;

  return (
    <div className={rowClassName(isCounted)}>
      <div className="min-w-0 flex items-center gap-2">
        <span className={dotClassName(isCounted)} aria-hidden />
        <span className="truncate text-sm font-medium text-foreground">{row.itemName}</span>
        <span className="shrink-0 text-xs text-muted-foreground">{row.uom}</span>
      </div>
      <span className="text-right text-sm tabular-nums text-muted-foreground">
        {moneyOrDash(row.lastCost)}
      </span>
      <Input
        type="number"
        value={qtyInputValueOf(row.countedQty)}
        disabled={readOnly}
        placeholder="0"
        className="h-8 text-right text-sm tabular-nums"
        onChange={(e) => onQtyChange(row.itemId, parseQtyInput(e.target.value))}
      />
      <span className={valueClassName(isCounted)}>{moneyOrDash(row.lineValue)}</span>
    </div>
  );
}
