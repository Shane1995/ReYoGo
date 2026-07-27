import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@reyogo/ui';
import { fmt } from '@/pages/Inventory/Analysis/utils/format';
import type { StockOnHandTableProps } from './types';

export function StockOnHandTable({ rows, grandTotal }: StockOnHandTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--nav-border)] bg-muted/10 p-10 text-center text-sm text-muted-foreground/60">
        No items match the selected categories.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--nav-border)] overflow-hidden print:border-none print:rounded-none">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30 border-[var(--nav-border)] print:bg-white">
            <TableHead>Item</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Avg Cost</TableHead>
            <TableHead className="text-right">Total Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.itemId} className="print:bg-white">
              <TableCell className="py-2.5 font-medium text-foreground">{row.itemName}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {row.categoryName ?? '—'}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{row.uom ?? '—'}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{row.quantity}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {fmt(row.avgCost)}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums font-medium">
                {fmt(row.totalValue)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="bg-muted/20 hover:bg-muted/20 print:bg-white">
            <TableCell colSpan={5} className="text-right font-semibold">
              Grand Total
            </TableCell>
            <TableCell className="text-right font-mono tabular-nums font-semibold">
              {fmt(grandTotal)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
