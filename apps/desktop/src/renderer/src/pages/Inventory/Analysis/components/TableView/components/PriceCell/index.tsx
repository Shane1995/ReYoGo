import { TableCell } from '@reyogo/ui';
import { fmt } from '../../../../utils/format';
import type { PriceCellProps } from './types';

export function PriceCell({ last }: PriceCellProps) {
  const hasVat = last.unitPrice !== last.unitPriceInclVat;
  return (
    <TableCell className="py-2.5 text-right font-mono text-sm tabular-nums text-foreground">
      <div>
        {hasVat ? <span className="text-muted-foreground/50 font-normal">Incl. </span> : null}
        {fmt(last.unitPriceInclVat)}
        {last.uom ? <span className="text-muted-foreground/60"> / {last.uom}</span> : null}
      </div>
      {hasVat && (
        <div className="text-[11px] text-muted-foreground/50 font-normal">
          Excl. {fmt(last.unitPrice)}
        </div>
      )}
    </TableCell>
  );
}
