import { TableCell } from '@reyogo/ui';
import type { ICapturedInvoiceWithLines } from '@reyogo/types';
import { formatMoney } from '../../../../utils/formatMoney';
import { invoiceTotals } from '../../../../utils/invoiceTotals';

const EMPTY = '—';

function cellValue<T>(value: T | null | undefined, format: (value: T) => string): string {
  if (value == null) return EMPTY;
  return format(value);
}

function lineCountValue(detail: ICapturedInvoiceWithLines | undefined): string {
  return cellValue(detail?.lines.length, (count) => String(count));
}

function totalsOf(
  detail: ICapturedInvoiceWithLines | undefined,
): ReturnType<typeof invoiceTotals> | null {
  if (!detail) return null;
  return invoiceTotals(detail);
}

export function InvoiceAmountCells({ detail }: { detail: ICapturedInvoiceWithLines | undefined }) {
  const totals = totalsOf(detail);
  return (
    <>
      <TableCell className="text-right text-sm text-muted-foreground tabular-nums">
        {lineCountValue(detail)}
      </TableCell>
      <TableCell className="text-right font-mono text-sm tabular-nums">
        {cellValue(totals?.excl, formatMoney)}
      </TableCell>
      <TableCell className="text-right font-mono text-sm tabular-nums text-muted-foreground">
        {cellValue(totals?.vat, formatMoney)}
      </TableCell>
      <TableCell className="text-right font-mono text-sm tabular-nums font-semibold">
        {cellValue(totals?.total, formatMoney)}
      </TableCell>
    </>
  );
}
