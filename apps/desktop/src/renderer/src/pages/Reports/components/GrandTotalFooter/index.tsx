import { Table, TableFooter, TableRow, TableCell } from '@reyogo/ui';
import { formatZAR } from '@/utils/format';
import type { GrandTotalFooterProps } from './types';

export function GrandTotalFooter({ colSpan, total }: GrandTotalFooterProps) {
  return (
    <div className="rounded-lg border border-[var(--nav-border)] overflow-hidden">
      <Table>
        <TableFooter>
          <TableRow className="bg-muted/20 hover:bg-muted/20">
            <TableCell colSpan={colSpan} className="text-right font-semibold">
              Grand Total
            </TableCell>
            <TableCell className="text-right font-mono tabular-nums font-semibold">
              {formatZAR(total)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
