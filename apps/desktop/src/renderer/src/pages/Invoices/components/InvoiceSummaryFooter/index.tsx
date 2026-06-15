import { formatMoney } from '../../utils/formatMoney';
import { SummaryStats } from './components/SummaryStats';
import { SaveButtons } from './components/SaveButtons';
import type { InvoiceSummaryFooterProps } from './types';

export function InvoiceSummaryFooter({
  summary,
  isSaving,
  isSavingDraft,
  canSave,
  isDirty,
  onSave,
  onSaveDraft,
}: InvoiceSummaryFooterProps) {
  return (
    <footer
      className="shrink-0 sticky bottom-0 left-0 right-0 z-10 border-t border-[var(--nav-border)] bg-background/97 backdrop-blur supports-[backdrop-filter]:bg-background/90 shadow-[0_-1px_0_0_var(--nav-border),0_-8px_24px_-4px_rgba(0,0,0,0.06)]"
      aria-label="Invoice summary"
    >
      <div className="flex min-w-0 items-center justify-between gap-6 px-4 py-3">
        <SummaryStats
          lineCount={summary.lineCount}
          subtotal={summary.subtotal}
          totalVat={summary.totalVat}
          isDirty={isDirty}
        />
        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground/60 leading-none mb-0.5">
              Total
            </span>
            <span className="font-mono text-[22px] font-semibold text-foreground leading-none tabular-nums">
              {formatMoney(summary.grandTotal)}
            </span>
          </div>
          <SaveButtons
            isSaving={isSaving}
            isSavingDraft={isSavingDraft}
            canSave={canSave}
            onSave={onSave}
            onSaveDraft={onSaveDraft}
          />
        </div>
      </div>
    </footer>
  );
}
