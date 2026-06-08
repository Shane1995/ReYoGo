import { Button } from '@reyogo/ui';
import { formatMoney } from '../../utils/formatMoney';

function SummaryStats({
  lineCount,
  subtotal,
  totalVat,
  isDirty,
}: {
  lineCount: number;
  subtotal: number;
  totalVat: number;
  isDirty: boolean;
}) {
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

function draftLabelOf(isSavingDraft: boolean): string {
  if (isSavingDraft) return 'Saving…';
  return 'Save draft';
}

function postLabelOf(isSaving: boolean): string {
  if (isSaving) return 'Posting…';
  return 'Post invoice';
}

function SaveButtons({
  isSaving,
  isSavingDraft,
  canSave,
  onSave,
  onSaveDraft,
}: {
  isSaving: boolean;
  isSavingDraft: boolean;
  canSave: boolean;
  onSave: () => void;
  onSaveDraft: () => void;
}) {
  const disabled = isSaving || isSavingDraft || !canSave;
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onSaveDraft}
        disabled={disabled}
        className="min-w-[100px] text-muted-foreground"
      >
        {draftLabelOf(isSavingDraft)}
      </Button>
      <Button
        type="button"
        size="sm"
        onClick={onSave}
        disabled={disabled}
        className="min-w-[110px]"
      >
        {postLabelOf(isSaving)}
      </Button>
    </div>
  );
}

type Summary = {
  lineCount: number;
  subtotal: number;
  totalVat: number;
  grandTotal: number;
};

type Props = {
  summary: Summary;
  isSaving: boolean;
  isSavingDraft: boolean;
  canSave: boolean;
  isDirty: boolean;
  onSave: () => void;
  onSaveDraft: () => void;
};

export function InvoiceSummaryFooter({
  summary,
  isSaving,
  isSavingDraft,
  canSave,
  isDirty,
  onSave,
  onSaveDraft,
}: Props) {
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
