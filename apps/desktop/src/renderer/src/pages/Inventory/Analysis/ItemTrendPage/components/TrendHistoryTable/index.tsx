import { fmt, fmtDate, fmtPct } from '../../../utils/format';
import { changeCls } from '../../../utils/styles';
import { pctChangeOf } from '../../../utils/pctChangeOf';
import { prevPriceOf } from './utils/prevPriceOf';
import type { TrendHistoryTableProps } from './types';

export function TrendHistoryTable({ entries }: TrendHistoryTableProps) {
  return (
    <div className="rounded-lg border border-[var(--nav-border)] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--nav-border)] bg-muted/30">
            <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70">
              Date
            </th>
            <th className="px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70">
              Qty
            </th>
            <th className="px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70">
              Unit price
            </th>
            <th className="px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70">
              vs prev
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => {
            const diff = pctChangeOf(e.unitPrice, prevPriceOf(entries, i));
            return (
              <tr
                key={`${e.invoiceId}-${i}`}
                className="border-t border-[var(--nav-border)] hover:bg-muted/20 transition-colors"
              >
                <td className="px-4 py-2.5 text-sm text-muted-foreground">{fmtDate(e.date)}</td>
                <td className="px-4 py-2.5 text-right font-mono text-sm tabular-nums text-muted-foreground">
                  {e.quantity}
                  {e.uom ? <span className="text-muted-foreground/50"> {e.uom}</span> : ''}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-sm tabular-nums font-medium text-foreground">
                  {fmt(e.unitPrice)}
                </td>
                <td
                  className={`px-4 py-2.5 text-right font-mono text-sm tabular-nums ${changeCls(diff)}`}
                >
                  {diff === null ? (
                    <span className="text-muted-foreground/30">—</span>
                  ) : (
                    fmtPct(diff)
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
