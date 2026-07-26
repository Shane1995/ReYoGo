# Invoice Reports — Design Spec

**Date:** 2026-07-26
**Trello cards:** [#252 Exporting of reports](https://trello.com/c/YJSMBtwG/252-exporting-of-reports), [#253 Reports needed](https://trello.com/c/a2dz1ifQ/253-reports-needed)
**Depends on:** fix for [#254 Analysis doesn't indicate incl/excl VAT](https://trello.com/c/5sYfD8pP/254-analysis-does-indicate-if-the-price-is-including-or-excluding-vat) — must land first (see Dependency section)
**Goal:** Turn the `Cost Report` stub page into a real, exportable, filterable reporting feature.

---

## Context

Two Trello cards describe the same underlying gap from different angles:

- **#252** — "I need to be able to save a report of the invoice captured." → wants an exportable artifact.
- **#253** — "Need to be able to create a report with a specific date range and then be able to select filters on what I actually want to pull the report on so like by category." → wants a filterable, period-scoped report.

The app already has three separate "price/cost over time" surfaces (Analysis table view, ItemTrendPage stock-movement ledger, and the still-stub PriceVariance page). Consolidating all three is out of scope here — this spec adds a **Reports** page that reuses the existing Analysis data layer (which already carries per-purchase unit price, incl./excl. VAT amounts, category, and date) rather than duplicating query logic, and adds export on top. `CostReportPage` at `apps/desktop/src/renderer/src/pages/Inventory/Costing/CostReport/index.tsx` is already routed at `CostingRouteSegments.costReport` — this feature replaces that stub in place.

## Dependency: VAT mode must be fixed first

Card #254's fix (tracked separately, see companion bug work) adds `vatMode` to `InvoiceLineWithDate` and plumbs it through `getLinesForAnalysis`. Building the Item Cost History view before that fix lands would mean building the "shows inclusive and exclusive values, correctly labeled" requirement on top of data that doesn't carry the label. Sequencing: #254 fix → this feature.

---

## Feature Shape: One Reports page, two views

Both views share one date range + entity filter (entity scoping matches the pattern in `stock-movements:get-cogs` / `invoices:get-lines-for-analysis`, which both already accept an optional `entityId`).

### View A — Item Cost History

Per item, every purchase in the selected window, using `buildItemGroups`/`ItemGroup`/`ItemEntry` from the Analysis module as the data source (no new query — reuse `useAnalysisLines` + `buildItemGroups`).

Columns per entry: date, quantity, unit cost excl. VAT, unit cost incl. VAT, VAT mode (Inclusive/Exclusive — sourced from the #254 fix), and **% change vs. the previous entry for that item**. Entries whose absolute % change exceeds a threshold are visually flagged (badge/highlight), so a price jump is obvious without reading every row.

- Threshold: `PRICE_CHANGE_ALERT_THRESHOLD_PERCENT = 10` — named constant, not a magic number, colocated in this feature's `constants.ts`. No existing threshold constant exists elsewhere to reuse (`PriceVariance` page is currently a stub with no threshold defined).
- Category filter reuses `computeAvailableCategories`/`filterGroups` already in `useAnalysisData` — extract the shared filtering logic into a hook usable by both Analysis and Reports rather than copy-pasting it (per repo convention: merge overlapping hooks, no duplication).

### View B — Period Summary

Date range + category filter → totals and a by-category breakdown for the window, sourced from `stock-movements:get-cogs` (`COGSSummary`), same data source as the existing Costing Dashboard. This directly answers card #253's ask.

### Export

An "Export to XLSX" action exports whichever view is currently active, with its current filters applied. Reuses the existing SheetJS pattern from `CsvImport`'s `downloadTemplate` (`apps/desktop/src/renderer/src/components/CsvImport/parser/index.ts`): build a workbook client-side with `XLSX.utils.book_new()`/`aoa_to_sheet()`, serialize to base64, and hand off to the existing `shell:save-file-base64` IPC channel (already writes to the OS Downloads folder and opens the file). No new IPC channel needed for export itself.

This covers card #252 — "save a report of the invoice captured" — without a separate single-invoice export path; the Item Cost History view filtered to one item/date range serves that need without new plumbing. If a literal single-invoice printout turns out to be needed instead, that's a follow-up card, not part of this spec.

### Explicitly out of scope (YAGNI)

- PDF export (no PDF library in the repo; XLSX only, consistent with existing export tooling).
- Scheduled/emailed reports.
- Saved report presets/bookmarks.
- Consolidating Item Cost History with `ItemTrendPage`'s stock-movement ledger view or the `PriceVariance` stub — separate concern, not touched here.

---

## Data Flow / File Layout (follows repo conventions)

- `apps/desktop/src/renderer/src/pages/Inventory/Costing/CostReport/index.tsx` — page shell (tab switcher between the two views), no inline types/constants/logic per file-org conventions.
- `CostReport/types.ts`, `CostReport/constants.ts` — extracted types/constants (view mode union, threshold constant).
- `CostReport/components/ItemCostHistoryView/`, `CostReport/components/PeriodSummaryView/` — one component per file, sub-components co-located.
- `CostReport/hooks/useReportExport/` — builds and triggers the XLSX export for whichever view is active; own `index.test.ts`.
- Shared filtering logic currently inline in `Analysis/hooks/useAnalysisData` gets extracted to a hook (exact location TBD at plan time — likely lifted to a common ancestor since both `Analysis` and `CostReport` will consume it) so neither feature duplicates `filterGroups`/`computeAvailableCategories`.

---

## Testing

- `useReportExport`: verify workbook contents built match the visible filtered rows for each view (unit test, not a snapshot of the XLSX binary).
- Extracted shared filter hook: existing Analysis test coverage should continue to pass unchanged after extraction; add coverage for the % change / threshold-flagging logic in Item Cost History (this is new business logic, not currently tested anywhere).
- Period Summary view: reuse existing `COGSSummary`-consuming test patterns from Costing Dashboard tests as a reference.

---

## Open decisions I made a call on (flag if wrong)

1. **10% threshold** for flagging price changes — arbitrary but reasonable default; easy to tune later since it's a named constant, not baked into logic.
2. **Reuse Analysis's data layer** rather than a new query — avoids a second, parallel "get invoice lines with cost" implementation (the research for #254 already found one unwanted duplicate; didn't want to create a second).
3. **Single invoice export folded into Item Cost History** rather than being its own page — if you actually want a "print this one invoice" style report distinct from the item-history table, let me know and I'll split it out as its own small addition.
