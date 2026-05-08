export function FormatGuide() {
  return (
    <div className="rounded-lg border border-[var(--nav-border)] bg-muted/20 p-4 space-y-3 text-sm">
      <p className="font-semibold text-foreground">Expected format</p>
      <p className="text-muted-foreground">
        Use the Excel template — it has three sheets. Fill in only the sheets you need. Items that
        reference a category not in the Categories sheet will be{" "}
        <span className="font-medium text-amber-700">auto-created</span> (you can review before committing).
      </p>
      <div className="space-y-2">
        {[
          {
            sheet: "Units",
            cols: [{ name: "name", note: "e.g. litres, kgs, pieces" }],
          },
          {
            sheet: "Categories",
            cols: [
              { name: "name" },
              { name: "type", note: "food · drink · non-perishable" },
            ],
          },
          {
            sheet: "Items",
            cols: [
              { name: "name" },
              { name: "category_name", note: "must match a category name" },
              { name: "unit", note: "optional" },
            ],
          },
        ].map((s) => (
          <div key={s.sheet} className="flex items-start gap-3">
            <code className="shrink-0 bg-background border border-[var(--nav-border)] rounded px-2 py-0.5 text-xs font-mono">
              {s.sheet}
            </code>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {s.cols.map((c) => (
                <span key={c.name} className="text-xs text-muted-foreground">
                  <code className="text-foreground">{c.name}</code>
                  {c.note ? ` — ${c.note}` : ""}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
