import { TableCell, TableRow, Badge } from '@reyogo/ui';
import { fmtDate } from '@/pages/Inventory/Analysis/utils/format';
import { formatZAR } from '@/utils/format';
import { changeCls } from '@/pages/Inventory/Analysis/utils/styles';
import type { ExpandedPurchasesRowProps } from './types';

export function ExpandedPurchasesRow({ rows }: ExpandedPurchasesRowProps) {
  return (
    <TableRow className="border-[var(--nav-border)] hover:bg-transparent">
      <TableCell />
      <TableCell colSpan={7} className="py-3 bg-[var(--nav-accent)]/20">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="pb-2 text-left text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
                Date
              </th>
              <th className="pb-2 text-right text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
                Qty
              </th>
              <th className="pb-2 text-right text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
                Excl. VAT
              </th>
              <th className="pb-2 text-right text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
                Incl. VAT
              </th>
              <th className="pb-2 text-center text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
                Taxable
              </th>
              <th className="pb-2 text-right text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
                % Change
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={`${row.invoiceId}-${i}`} className="border-t border-[var(--nav-border)]/40">
                <td className="py-1.5 text-muted-foreground">{fmtDate(row.date)}</td>
                <td className="py-1.5 text-right font-mono tabular-nums">{row.quantity}</td>
                <td className="py-1.5 text-right font-mono tabular-nums">
                  {formatZAR(row.unitCostExclVat)}
                </td>
                <td className="py-1.5 text-right font-mono tabular-nums">
                  {formatZAR(row.unitCostInclVat)}
                </td>
                <td className="py-1.5 text-center">
                  {row.isVatable ? (
                    <span className="text-[var(--nav-active-border)]">✓</span>
                  ) : (
                    <span className="text-muted-foreground/30">—</span>
                  )}
                </td>
                <td className="py-1.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <span className={changeCls(row.pctChange)}>
                      {row.pctChange === null ? '—' : `${row.pctChange.toFixed(1)}%`}
                    </span>
                    {row.flagged && <Badge variant="destructive">Jump</Badge>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCell>
    </TableRow>
  );
}
