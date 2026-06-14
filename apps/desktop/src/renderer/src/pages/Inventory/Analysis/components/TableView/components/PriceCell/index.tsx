import { TableCell } from '@reyogo/ui';
import { fmt } from '../../../../utils/format';
import type { PriceCellProps } from './types';

export function PriceCell({ last }: PriceCellProps) {
  return (
    <TableCell className="py-2.5 text-right font-mono text-sm tabular-nums text-foreground">
      <div>
        {fmt(last.unitPriceInclVat)}
        {last.uom ? <span className="text-muted-foreground/60"> / {last.uom}</span> : null}
      </div>
      {last.unitPrice !== last.unitPriceInclVat && (
        <div className="text-[11px] text-muted-foreground/50 font-normal">
          excl. {fmt(last.unitPrice)}
        </div>
      )}
    </TableCell>
  );
}
