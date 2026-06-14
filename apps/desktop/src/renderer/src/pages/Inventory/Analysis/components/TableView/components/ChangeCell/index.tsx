import { cn } from '@reyogo/ui';
import { TableCell } from '@reyogo/ui';
import { fmtPct } from '../../../../utils/format';
import { changeCls } from '../../../../utils/styles';
import type { ChangeCellProps } from './types';

export function ChangeCell({ change }: ChangeCellProps) {
  return (
    <TableCell
      className={cn('py-2.5 text-right font-mono text-sm tabular-nums', changeCls(change, true))}
    >
      {change === null ? <span className="text-muted-foreground/30">—</span> : fmtPct(change)}
    </TableCell>
  );
}
