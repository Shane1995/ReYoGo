import { cn } from '@reyogo/ui';
import { fmt, fmtDate, fmtPct } from '../../../../utils/format';
import { changeCls } from '../../../../utils/styles';
import type { ItemGroup } from '../../../../types';

type Props = {
  entries: ItemGroup['entries'];
};

function prevInclVatOf(entries: ItemGroup['entries'], index: number): number | null {
  if (index <= 0) return null;
  const prev = entries[index - 1];
  if (!prev) return null;
  return prev.unitPriceInclVat;
}

function pctChangeOf(current: number, prev: number | null): number | null {
  if (prev === null) return null;
  if (prev <= 0) return null;
  return ((current - prev) / prev) * 100;
}

export function ExpandedEntries({ entries }: Props) {
  return (
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
            UoM
          </th>
          <th className="pb-2 text-right text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
            Unit price
          </th>
          <th className="pb-2 text-right text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
            vs prev
          </th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry, ei) => {
          const pct = pctChangeOf(entry.unitPriceInclVat, prevInclVatOf(entries, ei));
          return (
            <tr key={`${entry.invoiceId}-${ei}`} className="border-t border-[var(--nav-border)]/40">
              <td className="py-1.5 text-muted-foreground">{fmtDate(entry.date)}</td>
              <td className="py-1.5 text-right font-mono tabular-nums">{entry.quantity}</td>
              <td className="py-1.5 text-right text-muted-foreground/60">{entry.uom ?? '—'}</td>
              <td className="py-1.5 text-right font-mono font-medium tabular-nums">
                <div>{fmt(entry.unitPriceInclVat)}</div>
                {entry.unitPrice !== entry.unitPriceInclVat && (
                  <div className="text-[11px] text-muted-foreground/50 font-normal">
                    excl. {fmt(entry.unitPrice)}
                  </div>
                )}
              </td>
              <td className={cn('py-1.5 text-right font-mono tabular-nums', changeCls(pct))}>
                {pct === null ? <span className="text-muted-foreground/30">—</span> : fmtPct(pct)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
