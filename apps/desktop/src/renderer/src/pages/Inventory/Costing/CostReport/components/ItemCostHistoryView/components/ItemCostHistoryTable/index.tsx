import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from '@reyogo/ui';
import { fmt, fmtDate } from '@/pages/Inventory/Analysis/utils/format';
import { changeCls } from '@/pages/Inventory/Analysis/utils/styles';
import type { ItemCostHistoryTableProps } from './types';

export function ItemCostHistoryTable({ rows }: ItemCostHistoryTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--nav-border)] bg-muted/10 p-10 text-center text-sm text-muted-foreground/60">
        No purchases for the selected range or category.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--nav-border)] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30 border-[var(--nav-border)]">
            <TableHead>Item</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Excl. VAT</TableHead>
            <TableHead className="text-right">Incl. VAT</TableHead>
            <TableHead className="text-center">Taxable</TableHead>
            <TableHead className="text-right">% Change</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={`${row.itemId}-${row.invoiceId}-${i}`}>
              <TableCell>
                {row.itemName}
                {row.uom ? <span className="text-muted-foreground/60"> / {row.uom}</span> : null}
              </TableCell>
              <TableCell className="text-muted-foreground">{fmtDate(row.date)}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{row.quantity}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {fmt(row.unitCostExclVat)}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {fmt(row.unitCostInclVat)}
              </TableCell>
              <TableCell className="text-center">
                {row.isVatable ? (
                  <span className="text-[var(--nav-active-border)]">✓</span>
                ) : (
                  <span className="text-muted-foreground/30">—</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <span className={changeCls(row.pctChange)}>
                    {row.pctChange === null ? '—' : `${row.pctChange.toFixed(1)}%`}
                  </span>
                  {row.flagged && <Badge variant="destructive">Jump</Badge>}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
