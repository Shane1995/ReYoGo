import { fmt, fmtDate } from '../../../utils/format';
import type { FullHistoryTableProps } from './types';

export function FullHistoryTable({ movements }: FullHistoryTableProps) {
  if (movements.length === 0) {
    return <p className="px-4 py-3 text-sm text-muted-foreground">No movements recorded</p>;
  }

  return (
    <div className="rounded-lg border border-[var(--nav-border)] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--nav-border)] bg-muted/30">
            <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70">
              Date
            </th>
            <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70">
              Type
            </th>
            <th className="px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70">
              Qty
            </th>
            <th className="px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70">
              Stock After
            </th>
            <th className="px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70">
              WAC After
            </th>
            <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70">
              Reference
            </th>
          </tr>
        </thead>
        <tbody>
          {movements.map((m) => (
            <tr
              key={m.id}
              className="border-t border-[var(--nav-border)] hover:bg-muted/20 transition-colors"
            >
              <td className="px-4 py-2.5 text-sm text-muted-foreground">{fmtDate(m.occurredAt)}</td>
              <td className="px-4 py-2.5 text-sm text-foreground">{m.movementType}</td>
              <td className="px-4 py-2.5 text-right font-mono text-sm tabular-nums text-muted-foreground">
                {m.qty}
              </td>
              <td className="px-4 py-2.5 text-right font-mono text-sm tabular-nums text-muted-foreground">
                {m.stockQtyAfter}
              </td>
              <td className="px-4 py-2.5 text-right font-mono text-sm tabular-nums text-foreground">
                {m.weightedAvgCostAfter === null ? '—' : fmt(m.weightedAvgCostAfter)}
              </td>
              <td className="px-4 py-2.5 text-sm text-muted-foreground">
                {m.referenceLabel ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
