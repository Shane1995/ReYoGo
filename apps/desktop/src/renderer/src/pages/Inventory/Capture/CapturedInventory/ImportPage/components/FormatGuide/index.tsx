import { FORMAT_GUIDE_SHEETS } from './constants';

export function FormatGuide() {
  return (
    <div className="rounded-lg border border-[var(--nav-border)] bg-muted/20 p-4 space-y-3 text-sm">
      <p className="font-semibold text-foreground">Expected format</p>
      <p className="text-muted-foreground">
        Use the Excel template — it has three sheets. Fill in only the sheets you need. Items that
        reference a category not in the Categories sheet will be{' '}
        <span className="font-medium text-amber-700">auto-created</span> (you can review before
        committing).
      </p>
      <div className="space-y-2">
        {FORMAT_GUIDE_SHEETS.map((s) => (
          <div key={s.sheet} className="flex items-start gap-3">
            <code className="shrink-0 bg-background border border-[var(--nav-border)] rounded px-2 py-0.5 text-xs font-mono">
              {s.sheet}
            </code>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {s.cols.map((c) => (
                <span key={c.name} className="text-xs text-muted-foreground">
                  <code className="text-foreground">{c.name}</code>
                  {c.note ? ` — ${c.note}` : ''}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
