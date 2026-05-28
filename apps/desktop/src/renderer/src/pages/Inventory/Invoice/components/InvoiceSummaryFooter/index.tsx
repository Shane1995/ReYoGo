import { Button } from '@reyogo/ui';
import { formatMoney } from '../../utils/formatMoney';

type Summary = {
  lineCount: number;
  subtotal: number;
  totalVat: number;
  grandTotal: number;
};

type Props = {
  summary: Summary;
  isSaving: boolean;
  canSave: boolean;
  isDirty: boolean;
  onSave: () => void;
};

export function InvoiceSummaryFooter({ summary, isSaving, canSave, isDirty, onSave }: Props) {
  return (
    <footer
      className="shrink-0 sticky bottom-0 left-0 right-0 z-10 border-t border-[var(--nav-border)] bg-background/97 backdrop-blur supports-[backdrop-filter]:bg-background/90 shadow-[0_-1px_0_0_var(--nav-border),0_-8px_24px_-4px_rgba(0,0,0,0.06)]"
      aria-label="Invoice summary"
    >
      <div className="flex min-w-0 items-center justify-between gap-6 px-4 py-3">
        <div className="flex min-w-0 items-center gap-5 overflow-hidden">
          {isDirty && (
            <span className="shrink-0 inline-flex items-center gap-1.5 bg-[var(--nav-accent)] text-[var(--nav-accent-foreground)] text-[11px] font-medium tracking-wide px-2.5 py-1 rounded-full">
              <span className="size-1.5 rounded-full bg-primary animate-pulse inline-block" />
              Unsaved
            </span>
          )}

          <div className="flex items-center gap-5 text-sm">
            <span className="shrink-0 text-muted-foreground tabular-nums">
              <span className="font-mono font-semibold text-foreground">
                {summary.lineCount}
              </span>{' '}
              {summary.lineCount !== 1 ? 'lines' : 'line'}
            </span>

            <div className="hidden sm:flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground/60">
                Excl.
              </span>
              <span className="font-mono text-sm tabular-nums text-foreground">
                {formatMoney(summary.subtotal)}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground/60">
                VAT
              </span>
              <span className="font-mono text-sm tabular-nums text-foreground">
                {formatMoney(summary.totalVat)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground/60 leading-none mb-0.5">
              Total
            </span>
            <span className="font-mono text-[22px] font-semibold text-foreground leading-none tabular-nums">
              {formatMoney(summary.grandTotal)}
            </span>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={onSave}
            disabled={isSaving || !canSave}
            className="min-w-[110px]"
          >
            {isSaving ? 'Saving…' : 'Save invoice'}
          </Button>
        </div>
      </div>
    </footer>
  );
}
