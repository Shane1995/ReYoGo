import { Button } from "@/components/ui/button";
import { formatMoney } from "../utils/formatMoney";

type Summary = {
  lineCount: number;
  subtotal: number;
  totalVat: number;
  grandTotal: number;
};

type Props = {
  summary: Summary;
  isSaving: boolean;
  hasValidLines: boolean;
  onSave: () => void;
};

export function InvoiceSummaryFooter({ summary, isSaving, hasValidLines, onSave }: Props) {
  return (
    <footer
      className="shrink-0 sticky bottom-0 left-0 right-0 z-10 border-t border-[var(--nav-border)] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.08)]"
      aria-label="Invoice summary"
    >
      <div className="flex min-w-0 items-center justify-between gap-4 px-4 py-3">
        <div className="flex min-w-0 items-center gap-4 text-sm overflow-hidden">
          <span className="shrink-0 text-muted-foreground">
            <span className="font-medium text-foreground">{summary.lineCount}</span>{" "}
            line item{summary.lineCount !== 1 ? "s" : ""} added
          </span>
          <span className="shrink-0 text-muted-foreground">
            Excl. <span className="font-mono font-medium text-foreground">{formatMoney(summary.subtotal)}</span>
          </span>
          <span className="shrink-0 text-muted-foreground">
            VAT <span className="font-mono font-medium text-foreground">{formatMoney(summary.totalVat)}</span>
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Button type="button" size="sm" onClick={onSave} disabled={isSaving || !hasValidLines}>
            {isSaving ? "Saving…" : "Save invoice"}
          </Button>
          <span className="text-muted-foreground">Total:</span>
          <span className="text-xl font-semibold font-mono text-foreground">{formatMoney(summary.grandTotal)}</span>
        </div>
      </div>
    </footer>
  );
}
