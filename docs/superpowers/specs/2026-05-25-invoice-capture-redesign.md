# Invoice Capture Redesign

## Summary

Six concerns in one branch: update the DB schema to the new entity model, route the save call through the service layer, decompose `useInvoiceForm` into focused sub-hooks, redesign the invoice capture UI with a supplier selector, delete all I-prefixed types across every domain, restructure the pages folder so non-page components live in `components/` subdirectories, and add co-located unit tests. No code comments anywhere.

---

## 1. DB Schema Migration

Update `lib/db/src/schema.ts` to match the new entity model. Run `pnpm --filter @reyogo/db run db:generate` after to produce the migration file.

### `inventory_items`
| Change | Detail |
|---|---|
| Remove | `unit_of_measure TEXT`, `yield_factor REAL`, `par_level REAL` |
| Add | `unit_of_measure_id TEXT REFERENCES units_of_measure(id) ON DELETE SET NULL` |
| Add | `sku TEXT` |
| Keep | `id`, `account_id`, `name`, `category_id`, `reorder_point`, `reorder_qty`, `created_at`, `updated_at` |

`current_stock_qty` and `current_weighted_avg_cost` are **not stored** — repositories compute them via a subquery on the latest `stock_movements.stock_qty_after` and `stock_movements.weighted_avg_cost_after` for each item.

### `invoices`
| Change | Detail |
|---|---|
| Add | `status TEXT NOT NULL DEFAULT 'DRAFT'` with check constraint `IN ('DRAFT', 'POSTED')` |
| Add | `total_excl_tax REAL NOT NULL DEFAULT 0` |
| Add | `tax_amount REAL NOT NULL DEFAULT 0` |
| Add | `total_incl_tax REAL NOT NULL DEFAULT 0` |

### `invoice_line_items`
| Change | Detail |
|---|---|
| Rename | `item_id` → `inventory_item_id` |
| Rename | `quantity` → `qty` |
| Rename | `total_vat_exclude` → `total_cost` |
| Add | `unit_cost REAL NOT NULL DEFAULT 0` |
| Remove | `vat_mode TEXT`, `vat_rate REAL`, `item_name_snapshot TEXT`, `unit_of_measure TEXT` |

After schema changes, update all Drizzle `$inferSelect` / `$inferInsert` usages and regenerate the migration.

---

## 2. Service Layer Fix

`useInvoiceForm` calls `window.electronAPI.ipcRenderer.invoke(InvoicesIPC.SAVE_INVOICE, payload)` directly, importing `InvoicesIPC`. Replace with `invoiceService.saveInvoice(payload)` and remove the IPC import from the hook.

---

## 3. Hook Decomposition

Split `useInvoiceForm` (238 lines, 25 return values) into three focused sub-hooks. All co-located as `hooks/<name>/index.ts` + `hooks/<name>/index.test.ts`.

### `hooks/useDraftPersistence/index.ts`
Exports three pure helper functions (`loadDraft`, `saveDraft`, `clearDraft`) and a `useEffect` that auto-saves on change.
```
receives: lines, invoiceNumber, invoiceDate, isReused
returns: { clearDraft }
```

### `hooks/useLineManager/index.ts`
Owns `lines` state, all mutations, and the focus-after-add side effect.
```
returns: { lines, setLines, addLine(focusField?), removeLine(id), updateLine(id, updates), setAllVatMode(mode) }
```

### `hooks/useInvoiceSummary/index.ts`
Pure memoised derivations — no state, no side effects.
```
receives: lines, items, categories
returns: { invoiceSummary, validLines, itemsWithCategory, itemMetaMap }
```

### `hooks/useInvoiceForm/index.ts` (orchestrator)
Calls all three sub-hooks. Adds `supplierId` state. Owns `isSaving`, `saveError`, `handleSave` via `invoiceService.saveInvoice`. Modal state (`categoryModalOpen`, `itemModalOpen`) moves up to `InvoicePage`.

---

## 4. Invoice Capture UI Redesign

Design system: teal `#20C997`, DM Sans/Mono, `--nav-border` / `--nav-accent` tokens, shadcn/ui. No comments.

### InvoiceHeader
- **Row 1:** `PageHeader` with title + action buttons (unchanged)
- **Row 2:** Metadata strip — `Invoice #` · `Invoice date` · `Supplier` select — `bg-muted/20 border-b border-[var(--nav-border)] px-4 py-3 flex flex-wrap items-center gap-3`

Supplier: `<select>` populated from `suppliersService.getSuppliers()` fetched in `useInvoiceForm`. First option `"No supplier"` (value `""`).

### Line Table
- VAT mode raw `<select>` → shadcn/ui `<Select>` / `<SelectTrigger>` / `<SelectContent>` / `<SelectItem>`
- "Add row" button: bottom-left of table footer, teal ghost with `PlusIcon`

### Footer
Add `"Unsaved changes"` pill when `isDirty`: `bg-[var(--nav-accent)] text-[var(--nav-accent-foreground)] text-xs px-2 py-0.5 rounded-full`.

---

## 5. Full I-Type Removal — All Domains

With the new DB schema in place, entity types and DB shapes align. No bridge types needed. Full rename/replacement table:

| Old | New | Action |
|---|---|---|
| `ITimestamped` | `Timestamped` | rename in `base.ts` |
| `IInventoryCategory` | `Category` | delete — new entity, same shape |
| `IInventoryItem` | `InventoryItem` | delete — new entity shape now matches DB (after migration) |
| `IInventorySubmitPayload` | `InventorySubmitPayload` | rename |
| `IUnitOfMeasure` | `UnitOfMeasure` | delete — new entity, same shape |
| `ISupplier` | `Supplier` | delete — update `Supplier` entity to add `createdAt: Date` + `updatedAt: Date` |
| `IUpsertSupplierPayload` | `UpsertSupplierPayload` | rename |
| `IInvoice` | `Invoice` | delete — new entity shape now matches DB (after migration) |
| `IInvoiceLine` | `InvoiceLine` | delete — new entity shape now matches DB (after migration) |
| `IInvoiceWithLines` | `InvoiceWithLines` | add to `lib/types/src/invoices/index.ts`: `Invoice & { lines: InvoiceLine[] }` |
| `IInvoiceLineWithDate` | `InvoiceLineWithDate` | rename |
| `IInvoiceAuditEntry` | `InvoiceAuditEntry` | rename |
| `IInvoiceLinePayload` | `InvoiceLinePayload` | rename |
| `ISaveInvoicePayload` | `SaveInvoicePayload` | rename |
| `IUpdateInvoicePayload` | `UpdateInvoicePayload` | rename |
| `ICapturedInvoice` et al. | *(deleted)* | aliases — consumers use base types directly |
| `StockMovementType` | *(deleted)* | replaced by `MovementType` enum; update `schema.ts` |
| `ReferenceType` | `ReferenceType` | unchanged (no I prefix) |
| `IStockMovement` | `StockMovement` | delete — update `StockMovement` entity to add `notes: string \| null` and `createdAt: Date` |
| `IStockMovementSummary` | `StockMovementSummary` | rename |
| `IItemCostHistory` | `ItemCostHistory` | rename |
| `ICOGSSummary` | `COGSSummary` | rename |
| `IStocktakeSession` | `StocktakeSession` | rename |
| `IStocktakeLine` | `StocktakeLine` | rename |
| `IStocktakeSessionWithLines` | `StocktakeSessionWithLines` | rename |
| `ISaveStocktakeLinePayload` | `SaveStocktakeLinePayload` | rename |
| `ICompleteStocktakePayload` | `CompleteStocktakePayload` | rename |

Also delete `lib/types/src/schemas/` entirely (Zod schemas — not exported, not consumed anywhere).

### Entity type adjustments before deletion
- **`Supplier`** — add `createdAt: Date` and `updatedAt: Date`
- **`StockMovement`** — add `notes: string | null` and `createdAt: Date`; `movementType` uses `MovementType` enum
- **`lib/db/src/schema.ts`** — `.$type<StockMovementType>()` → `.$type<MovementType>()`, update import

---

## 6. Pages Folder Restructure

**Rule:** anything that is not a route-level page (confirmed from `routes.tsx`) must live in a `components/` subdirectory of the closest page directory that owns it. Layouts stay in `Layout/`.

### Confirmed route-level pages (stay as-is)
`Dashboard`, `CapturedInventoryIndex`, `ImportPage`, `AddItemsPage`, `AddCategoriesPage`, `InventoryAnalysis`, `ItemTrendPage`, `InvoicePage`, `InvoiceHistoryPage`, `CostingDashboard`, `PriceVariancePage`, `CostReportPage`, `SuppliersPage`

### Analysis — move to `Analysis/components/`
```
ByCategoryView/   → Analysis/components/ByCategoryView/
InsightChips/     → Analysis/components/InsightChips/
ItemCard/         → Analysis/components/ItemCard/
ItemChangeBar/    → Analysis/components/ItemChangeBar/
ItemDetailChart/  → Analysis/components/ItemDetailChart/
Sparkline/        → Analysis/components/Sparkline/
SummaryTableView/ → Analysis/components/SummaryTableView/
TableView/        → Analysis/components/TableView/
```

### Invoice Capture — move to `Invoice/components/`
```
InvoiceHeader/       → Invoice/components/InvoiceHeader/
InvoiceLineRow/      → Invoice/components/InvoiceLineRow/
InvoiceSummaryFooter/→ Invoice/components/InvoiceSummaryFooter/
ItemAutocomplete/    → Invoice/components/ItemAutocomplete/
ReuseNotice/         → Invoice/components/ReuseNotice/
```

### Invoice History — move to `History/components/`
```
History/AuditPanel/ → History/components/AuditPanel/
History/EditPanel/  → History/components/EditPanel/
```

### ImportPage — move to `ImportPage/components/`
```
ImportPage/DropZone/    → ImportPage/components/DropZone/
ImportPage/FormatGuide/ → ImportPage/components/FormatGuide/
```

All import paths in consuming files must be updated when components move.

---

## 7. Tests

Co-located `index.test.ts` files, BDD style, no comments.

### `hooks/useDraftPersistence/index.test.ts`
- `loadDraft` returns `null` when localStorage is empty
- `loadDraft` returns parsed state when valid JSON present
- `loadDraft` returns `null` on malformed JSON
- `saveDraft` writes correct JSON
- `clearDraft` removes the key

### `hooks/useLineManager/index.test.ts`
- `addLine` appends a line with a unique id
- `removeLine` removes the matching line
- `removeLine` resets to one empty line when the last line is removed
- `updateLine` merges partial updates
- `setAllVatMode` sets `vatMode` on every line

### `Invoice/types.test.ts`
Tests `getProcessLineComputed` for all three VAT modes, unit prices at qty=0, unit prices at qty>0.

---

## File Map

```
lib/db/src/
  schema.ts                                 — new DB shape for inventory_items, invoices, invoice_line_items
  repositories/inventory/index.ts           — InventoryItem with computed stock fields
  repositories/invoices/index.ts            — Invoice, InvoiceLine, SaveInvoicePayload, UpdateInvoicePayload
  repositories/setup/index.ts               — UnitOfMeasure
  repositories/stockMovements/index.ts      — StockMovement, StockMovementSummary, ItemCostHistory, COGSSummary
  repositories/stocktake/index.ts           — all renamed types
  repositories/suppliers/index.ts           — Supplier, UpsertSupplierPayload

lib/types/src/
  base.ts                                   — Timestamped
  schemas/                                  — DELETE entire directory
  inventory/index.ts                        — Category, InventoryItem, UnitOfMeasure, InventorySubmitPayload (all old I-types removed)
  suppliers/index.ts                        — Supplier (with timestamps), UpsertSupplierPayload
  invoices/index.ts                         — Invoice, InvoiceLine, InvoiceWithLines, InvoiceStatus, InvoiceLineWithDate, InvoiceAuditEntry, InvoiceLinePayload, SaveInvoicePayload, UpdateInvoicePayload (all I/ICaptured* removed)
  stockMovements/index.ts                   — StockMovement (updated), MovementType, StockMovementSummary, ItemCostHistory, COGSSummary (old I-types + StockMovementType removed)
  stocktake/index.ts                        — all renamed (no I prefix)
  setup/index.ts                            — UnitOfMeasure (delete IUnitOfMeasure)

apps/desktop/src/
  shared/types/ipc/invoke-map.ts            — all updated to new type names
  main/handlers/inventory/index.ts          — InventoryItem, InventorySubmitPayload
  main/handlers/setup/index.ts              — UnitOfMeasure
  main/handlers/suppliers/index.ts          — Supplier, UpsertSupplierPayload
  renderer/src/services/                    — all services updated
  renderer/src/pages/Inventory/
    Analysis/
      index.tsx                             — stays (page)
      ItemTrendPage/                        — stays (page)
      components/                           — NEW: ByCategoryView, InsightChips, ItemCard, ItemChangeBar, ItemDetailChart, Sparkline, SummaryTableView, TableView
      hooks/, utils/, types.ts              — unchanged location
    Invoice/
      index.tsx                             — stays (page); modal state lifted here
      components/                           — NEW: InvoiceHeader, InvoiceLineRow, InvoiceSummaryFooter, ItemAutocomplete, ReuseNotice
      hooks/
        useInvoiceForm/index.ts             — orchestrator + supplierId + invoiceService
        useDraftPersistence/index.ts        — NEW
        useDraftPersistence/index.test.ts   — NEW
        useLineManager/index.ts             — NEW
        useLineManager/index.test.ts        — NEW
        useInvoiceSummary/index.ts          — NEW
      types.ts                              — unchanged
      types.test.ts                         — NEW
      utils/                                — unchanged
      History/
        index.tsx                           — stays (page)
        components/                         — NEW: AuditPanel, EditPanel
        hooks/useInvoiceHistory/index.ts    — updated type names
    Capture/CapturedInventory/
      ImportPage/
        index.tsx                           — stays (page)
        components/                         — NEW: DropZone, FormatGuide
```

---

## Constraints

- Zero code comments in any file
- All hook test files: `index.test.ts` co-located with `index.ts`
- `pnpm run typecheck` passes before done
- `pnpm run test` passes before done
- DB migration generated via `db:generate`, not hand-written
