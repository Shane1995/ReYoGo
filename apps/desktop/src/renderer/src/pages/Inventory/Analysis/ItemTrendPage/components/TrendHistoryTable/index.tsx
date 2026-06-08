import { fmt, fmtDate, fmtPct } from '../../../utils/format';
import { changeCls } from '../../../utils/styles';
import type { ItemGroup } from '../../../types';

type Props = {
  entries: ItemGroup['entries'];
};

function prevPriceOf(entries: ItemGroup['entries'], index: number): number | null {
  if (index <= 0) return null;
  const prev = entries[index - 1];
  if (!prev) return null;
  return prev.unitPrice;
}

function pctChangeOf(current: number, prev: number | null): number | null {
  if (prev === null) return null;
  if (prev <= 0) return null;
  return ((current - prev) / prev) * 100;
}

export function TrendHistoryTable({ entries }: Props) {
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
