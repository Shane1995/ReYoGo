import { formatMoney } from '../../../../utils/formatMoney';
import type { SummaryStatsProps } from './types';

export function SummaryStats({ lineCount, subtotal, totalVat, isDirty }: SummaryStatsProps) {
  return (
    <div className="flex min-w-0 items-center gap-5 overflow-hidden">
      {isDirty && (
        <span className="shrink-0 inline-flex items-center gap-1.5 bg-[var(--nav-accent)] text-[var(--nav-accent-foreground)] text-[11px] font-medium tracking-wide px-2.5 py-1 rounded-full">
          <span className="size-1.5 rounded-full bg-primary animate-pulse inline-block" />
          Unsaved
        </span>
      )}
      <div className="flex items-center gap-5 text-sm">
        <span className="shrink-0 text-muted-foreground tabular-nums">
          <span className="font-mono font-semibold text-foreground">{lineCount}</span>{' '}
          {lineCount !== 1 ? 'lines' : 'line'}
        </span>
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground/60">
            Excl.
          </span>
          <span className="font-mono text-sm tabular-nums text-foreground">
            {formatMoney(subtotal)}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground/60">
            VAT
          </span>
          <span className="font-mono text-sm tabular-nums text-foreground">
            {formatMoney(totalVat)}
          </span>
        </div>
      </div>
    </div>
  );
}
