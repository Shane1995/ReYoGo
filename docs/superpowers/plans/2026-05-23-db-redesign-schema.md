# DB Redesign — Schema, Costing & Stock Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace 11 incremental migrations with a single clean migration. `stock_movements` becomes the authoritative ledger; WAC is computed and stored per IN movement within the posting transaction. No WAC or stock total stored on `inventory_items`.

**Architecture:** Wipe `apps/desktop/src/main/db/migrations/`, rewrite `schema.ts`, run `db:generate` once for a clean `0000` migration. Update shared types, data access, IPC enums, handlers, and renderer services to match the new shapes. No UI changes — data layer only.

**Tech Stack:** Drizzle ORM (better-sqlite3, synchronous SQLite), TypeScript, Electron IPC

---

## WAC Formula (reference for Task 9)

For each IN movement, compute before inserting:

1. Query `stock_movements` for the item's most recent row by `occurred_at DESC, created_at DESC` — get `stock_qty_after` (call it `prevQty`) and `weighted_avg_cost_after` (call it `prevWac`).
2. If no prior movement: `newWac = unitCostAtTime`, `newQtyAfter = incomingQty`
3. Otherwise: `newWac = round((prevQty * prevWac + incomingQty * unitCostAtTime) / (prevQty + incomingQty), 4)`, `newQtyAfter = prevQty + incomingQty`
4. Edge case — prevQty is 0: use `unitCostAtTime` as `newWac` (avoid divide-by-zero; prevWac is irrelevant)

For OUT movements: `stockQtyAfter = prevQty - outQty`, `unitCostAtTime = prevWac`, `weightedAvgCostAfter = prevWac` (unchanged), `totalCost = outQty * unitCostAtTime`

All reads and writes for a single invoice post must be inside one `db.transaction()` call.

---

## Task 1: Create git worktree

**Files:** none

- [ ] Run: `git worktree add .claude/worktrees/feat+db-redesign-schema -b feat/db-redesign-schema`
- [ ] All subsequent commands run from inside that worktree path

---

## Task 2: Wipe existing migrations

**Files:**
- Delete: `apps/desktop/src/main/db/migrations/` (all contents)

- [ ] Remove all migration SQL and meta files:
  `rm -rf apps/desktop/src/main/db/migrations && mkdir -p apps/desktop/src/main/db/migrations/meta`
- [ ] Confirm the directory exists and is empty (no .sql files, no meta/*.json)
- [ ] Commit: `chore: wipe existing migrations — starting fresh`

---

## Task 3: Rewrite schema.ts

**Files:**
- Modify: `apps/desktop/src/main/db/drizzle/schema.ts`

Complete replacement. Use `sqliteTable` from `drizzle-orm/sqlite-core`. All timestamps use `integer('...', { mode: 'timestamp' })`. All IDs are `text`. Define tables in dependency order (FK targets before FK sources).

**Tables to define:**

**`accounts`** — unchanged: id, name, isCurrent (boolean), createdAt, updatedAt

**`app_config`** — unchanged: key (PK), value

**`units_of_measure`** — unchanged: id, name, createdAt

**`inventory_categories`** — unchanged: id, name, type, createdAt, updatedAt

**`inventory_items`** — REMOVE `weighted_avg_cost` (real) and `total_stock` (real). Keep: id, name, categoryId (FK → inventory_categories, cascade delete), unitOfMeasure (nullable), createdAt, updatedAt

**`suppliers`** — NEW: id (PK), name (NOT NULL), contactName (nullable), phone (nullable), email (nullable), createdAt, updatedAt

**`invoices`** — replaces `captured_invoices`: id (PK), supplierId (nullable, FK → suppliers on delete SET NULL), invoiceNumber (nullable), invoiceDate (nullable timestamp), createdAt (NOT NULL), updatedAt (nullable)

**`invoice_line_items`** — replaces `captured_invoice_lines`: id (PK), invoiceId (FK → invoices, cascade delete), itemId (FK → inventory_items, restrict), itemNameSnapshot (NOT NULL), unitOfMeasure (nullable), quantity (real NOT NULL), vatMode (text NOT NULL), vatRate (real NOT NULL), totalVatExclude (real NOT NULL)

**`invoice_audit_log`** — update FK from old `captured_invoices` to `invoices`. Otherwise unchanged: id, invoiceId (FK → invoices, cascade), editedAt (NOT NULL), note (nullable), snapshot (text NOT NULL — JSON of IInvoiceWithLines)

**`stock_movements`** — FULL REDESIGN. New columns:
- `id`: text PK
- `inventoryItemId`: text NOT NULL, FK → inventory_items (restrict delete)
- `movementType`: text NOT NULL — `'IN' | 'OUT' | 'ADJUSTMENT' | 'WASTE' | 'RETURN'`
- `qty`: real NOT NULL
- `unitCostAtTime`: real nullable
- `totalCost`: real nullable — `qty × unitCostAtTime`, computed before insert
- `weightedAvgCostAfter`: real nullable — WAC after this movement (set for IN; null for WASTE/ADJUSTMENT)
- `stockQtyAfter`: real NOT NULL — running stock total after this movement
- `referenceType`: text nullable — `'invoice' | 'manual' | 'adjustment'`
- `referenceId`: text nullable
- `notes`: text nullable
- `occurredAt`: integer NOT NULL (timestamp mode) — business date of movement
- `createdAt`: integer NOT NULL (timestamp mode) — system insert time

REMOVED columns (do not include): `item_name_snapshot`, `cogs_amount`, `source`, `type` (replaced by `movementType` + `referenceType`)

**`costing_snapshots`** — schema only (empty for V1): id (PK), inventoryItemId (FK → inventory_items, cascade), snapshotDate (timestamp NOT NULL), weightedAvgCost (real), stockQty (real), createdAt (timestamp NOT NULL)

**Indexes** (define after table definitions using Drizzle's index helper):
- `stockMovementsByItemTime`: `stock_movements(inventory_item_id, occurred_at)` — costing queries
- `stockMovementsByRef`: `stock_movements(reference_type, reference_id)` — look up by invoice
- `invoiceLinesByInvoice`: `invoice_line_items(invoice_id)`
- `invoicesBySupplier`: `invoices(supplier_id)`

Export Drizzle-inferred types for every table (`$inferSelect` and `$inferInsert`).

- [ ] Rewrite `schema.ts` with all tables above
- [ ] Verify it compiles: `pnpm --filter @reyogo/desktop run typecheck 2>&1 | grep schema`

---

## Task 4: Generate the migration

**Files:** `apps/desktop/src/main/db/migrations/` (generated)

- [ ] Run: `pnpm --filter @reyogo/desktop run db:generate`
- [ ] Confirm a single `0000_*.sql` was created in `migrations/`
- [ ] Confirm `meta/_journal.json` and `meta/0000_snapshot.json` exist
- [ ] Open the SQL file and verify: all 10 tables present, correct column names (no `weighted_avg_cost` on items, `movement_type` not `type`, `inventory_item_id` not `item_id`, etc.), all 4 indexes present
- [ ] Commit: `feat: new schema.ts and 0000 migration — stock movements ledger`

---

## Task 5: Update shared types — stock movements

**File:** `lib/types/src/stockMovements/index.ts`

- [ ] Expand `StockMovementType` to `'IN' | 'OUT' | 'ADJUSTMENT' | 'WASTE' | 'RETURN'`
- [ ] Remove `StockMovementSource` type entirely (replaced by `referenceType` string)
- [ ] Update `IStockMovement`:
  - Remove: `source`, `cogsAmount`, `itemNameSnapshot`
  - Rename: `type` → `movementType`, `quantity` → `qty`, `costAtTime` → `unitCostAtTime`
  - Add: `totalCost: number | null`, `weightedAvgCostAfter: number | null`, `stockQtyAfter: number`, `referenceType: string | null`, `notes: string | null`, `occurredAt: Date`
- [ ] Update `IItemCostHistory`:
  - Keep `weightedAvgCost: number | null` and `totalStock: number` at top level (populated from latest movement — no source change visible to callers)
  - Update movements array entries: same field renames as `IStockMovement` (`movementType`, `qty`, `unitCostAtTime`, `weightedAvgCostAfter`, `stockQtyAfter`, `occurredAt`)
- [ ] Keep `ICOGSSummary` unchanged
- [ ] Verify: `pnpm --filter @reyogo/types run typecheck`

---

## Task 6: Update shared types — invoices

**File:** `lib/types/src/invoices/index.ts`

- [ ] Rename `ICapturedInvoice` → `IInvoice`, add `supplierId: string | null`
- [ ] Rename `ICapturedInvoiceLine` → `IInvoiceLine`
- [ ] Rename `ICapturedInvoiceWithLines` → `IInvoiceWithLines` (extends `IInvoice`, lines: `IInvoiceLine[]`)
- [ ] Keep `IInvoiceLineWithDate` name (already good), update base fields to use `IInvoiceLine`
- [ ] Rename `ICapturedInvoiceAuditEntry` → `IInvoiceAuditEntry`, update `snapshot: IInvoiceWithLines`
- [ ] Rename `ISaveCapturedInvoicePayload` → `ISaveInvoicePayload`, add `supplierId?: string | null`
- [ ] Rename `IUpdateCapturedInvoicePayload` → `IUpdateInvoicePayload`
- [ ] Keep all old names as type aliases for one step (e.g. `export type ICapturedInvoice = IInvoice`) — this lets you compile step by step and remove aliases in Task 15 cleanup
- [ ] Verify: `pnpm --filter @reyogo/types run typecheck`

---

## Task 7: Add supplier types

**File:** `lib/types/src/suppliers/index.ts` (NEW)

- [ ] Define `ISupplier`: id (string), name (string), contactName (string | null), phone (string | null), email (string | null), createdAt (Date), updatedAt (Date)
- [ ] Define `IUpsertSupplierPayload`: id (string), name (string), contactName? (string), phone? (string), email? (string)
- [ ] Update `lib/types/src/index.ts` — add `export * from './suppliers'`
- [ ] Verify: `pnpm --filter @reyogo/types run typecheck`

---

## Task 8: Update IPC enums and invoke-map

**File:** `apps/desktop/src/shared/types/ipc/suppliers.ts` (NEW)

- [ ] Define `SuppliersIPC` enum:
  - `GET_SUPPLIERS = 'suppliers:get-suppliers'`
  - `UPSERT_SUPPLIER = 'suppliers:upsert-supplier'`
  - `DELETE_SUPPLIER = 'suppliers:delete-supplier'`

**File:** `apps/desktop/src/shared/types/ipc/index.ts`

- [ ] Export `SuppliersIPC` from `'./suppliers'`

**File:** `apps/desktop/src/shared/types/ipc/invoke-map.ts`

- [ ] Update all `ICapturedInvoice*` type imports to new names (`IInvoice`, `IInvoiceLine`, `IInvoiceWithLines`, `IInvoiceAuditEntry`, `ISaveInvoicePayload`, `IUpdateInvoicePayload`)
- [ ] Add supplier entries to `IPCInvokeMap`:
  - `'suppliers:get-suppliers': { args: []; return: ISupplier[] }`
  - `'suppliers:upsert-supplier': { args: [payload: IUpsertSupplierPayload]; return: void }`
  - `'suppliers:delete-supplier': { args: [id: string]; return: void }`
- [ ] Add `ISupplier` and `IUpsertSupplierPayload` to the import list from `@reyogo/types`
- [ ] Verify: `pnpm --filter @reyogo/desktop run typecheck 2>&1 | grep "ipc/"` — should be zero errors in the ipc folder

---

## Task 9: Rewrite dataAccess/invoices

**File:** `apps/desktop/src/main/dataAccess/invoices/index.ts`

This is the most significant change. Key rules:
- All reads and writes for one invoice post/update are in **one `db.transaction()` call**
- WAC is computed inline using the formula defined at the top of this plan
- `recalcItemCosts` function is DELETED — WAC now lives on the movement row

**Function changes:**

`saveInvoice(payload: ISaveInvoicePayload): Promise<void>`
1. Inside one transaction:
   a. Insert into `invoices` (id, supplierId, invoiceNumber, invoiceDate, createdAt)
   b. Insert valid `invoice_line_items` (filter: itemId truthy, qty ≥ 0, totalVatExclude ≥ 0)
   c. For each valid line with qty > 0:
      - unitCostAtTime = totalVatExclude / qty
      - totalCost = qty * unitCostAtTime
      - Read latest movement for this item (within the tx — better-sqlite3 sees its own writes)
      - Compute WAC using the formula above
      - Insert `stock_movements` row: movementType='IN', referenceType='invoice', referenceId=invoiceId, occurredAt = invoiceDate ?? createdAt, inventoryItemId=itemId
2. No post-transaction work

`updateInvoice(payload: IUpdateInvoicePayload): Promise<void>`
- Same pattern: snapshot, delete old lines + movements with `referenceId=invoiceId`, re-insert new lines + movements with fresh WAC computation inside one transaction
- When deleting old movements, also re-read WAC state for affected items BEFORE deletion to avoid stale reads (or simply delete and recompute from scratch — simpler and safe since no production data)

`getInvoices(): Promise<IInvoice[]>` — select from `invoices`, map to `IInvoice` (include `supplierId`)

`getInvoicesWithLines(): Promise<IInvoiceWithLines[]>` — same as before, table rename only

`getInvoiceById(id: string): Promise<IInvoiceWithLines | null>` — table rename only

`getLinesForAnalysis(): Promise<IInvoiceLineWithDate[]>` — joins `invoice_line_items` → `invoices` → `inventory_items` → `inventory_categories`; column names updated

`getLastUnitPrices(): Promise<Record<string, number>>` — use `invoice_line_items` and `invoices` tables instead of old names

`getInvoiceAudit(invoiceId: string): Promise<IInvoiceAuditEntry[]>` — table rename, snapshot type is now `IInvoiceWithLines`

- [ ] Rewrite the file
- [ ] Verify: `pnpm --filter @reyogo/desktop run typecheck 2>&1 | grep "dataAccess/invoices"` — zero errors

---

## Task 10: Rewrite dataAccess/stockMovements

**File:** `apps/desktop/src/main/dataAccess/stockMovements/index.ts`

`getCurrentStockByItem(): Promise<Record<string, number>>`
Get `stockQtyAfter` from the latest movement per item. Use a subquery or `sql` tagged query: for each `inventory_item_id`, select the row where `(inventory_item_id, occurred_at, created_at)` is the maximum. Return a `Record<itemId, stockQtyAfter>`.

`getWeightedAvgCosts(): Promise<Record<string, number | null>>`
Get `weightedAvgCostAfter` from the latest IN movement per item (movementType = 'IN', latest by occurred_at DESC). Return `Record<itemId, weightedAvgCostAfter | null>`.

`getMovementsForItem(itemId: string): Promise<IStockMovement[]>`
Query where `inventoryItemId = itemId`. Map rows using new column names: `movementType`, `qty`, `unitCostAtTime`, `totalCost`, `weightedAvgCostAfter`, `stockQtyAfter`, `referenceType`, `notes`, `occurredAt`.

`getItemCostHistory(itemId: string): Promise<IItemCostHistory>`
- Get all movements for item (as above)
- Compute `weightedAvgCost`: get `weightedAvgCostAfter` from latest IN movement
- Compute `totalStock`: get `stockQtyAfter` from latest movement overall
- Return shape: `{ itemId, weightedAvgCost, totalStock, movements: [...] }`
- This keeps the existing `IItemCostHistory` shape — callers unchanged

`getCOGS(fromDate?: string, toDate?: string): Promise<ICOGSSummary>`
- Filter `movementType = 'OUT'` and optionally filter `occurredAt` by date range
- COGS per row = `qty * unitCostAtTime` (no longer reads `cogsAmount` column)
- Join to `inventory_items` → `inventory_categories` for category breakdown
- Return `ICOGSSummary` shape unchanged

- [ ] Rewrite the file
- [ ] Verify: `pnpm --filter @reyogo/desktop run typecheck 2>&1 | grep "dataAccess/stockMovements"` — zero errors

---

## Task 11: Update dataAccess/inventory

**File:** `apps/desktop/src/main/dataAccess/inventory/index.ts`

Minimal change — `weightedAvgCost` and `totalStock` no longer exist on the `inventory_items` table.

- [ ] In `upsertItem`: remove `weightedAvgCost` and `totalStock` from the INSERT `.values()` and UPDATE `.set()` calls
- [ ] Everything else stays the same
- [ ] Verify: `pnpm --filter @reyogo/desktop run typecheck 2>&1 | grep "dataAccess/inventory"` — zero errors

---

## Task 12: Add dataAccess/suppliers

**File:** `apps/desktop/src/main/dataAccess/suppliers/index.ts` (NEW)

Implement three functions using the `suppliers` schema table:

`getSuppliers(): Promise<ISupplier[]>` — SELECT all, ordered by name ASC, map rows to `ISupplier`

`upsertSupplier(payload: IUpsertSupplierPayload): Promise<void>` — check if exists, INSERT or UPDATE with current timestamp

`deleteSupplier(id: string): Promise<void>` — DELETE by id

- [ ] Create the file
- [ ] Verify: `pnpm --filter @reyogo/desktop run typecheck 2>&1 | grep "dataAccess/suppliers"` — zero errors

---

## Task 13: Update handlers

**File:** `apps/desktop/src/main/handlers/invoices/index.ts`

- [ ] Update type imports to new names: `ISaveInvoicePayload`, `IUpdateInvoicePayload` (instead of `ISaved/Updated CapturedInvoice*`)
- [ ] No functional changes — handlers are thin wrappers

**File:** `apps/desktop/src/main/handlers/suppliers/index.ts` (NEW)

- [ ] Import `ipcMain` from `electron`
- [ ] Import `SuppliersIPC` from `@shared/types/ipc`
- [ ] Import `* as suppliersDb` from `../../dataAccess/suppliers`
- [ ] Register three handlers inside `registerSuppliersHandlers()`:
  - `ipcMain.handle(SuppliersIPC.GET_SUPPLIERS, getSuppliers)`
  - `ipcMain.handle(SuppliersIPC.UPSERT_SUPPLIER, upsertSupplier)`
  - `ipcMain.handle(SuppliersIPC.DELETE_SUPPLIER, deleteSupplier)`
- [ ] Export `registerSuppliersHandlers`

**File:** `apps/desktop/src/main/ipc.ts`

- [ ] Import `registerSuppliersHandlers` from `'./handlers/suppliers'`
- [ ] Add `registerSuppliersHandlers()` call inside `registerIPC()`
- [ ] Verify: `pnpm --filter @reyogo/desktop run typecheck 2>&1 | grep "handlers/"` — zero errors

---

## Task 14: Update renderer services

**File:** `apps/desktop/src/renderer/src/services/invoice/index.ts`

- [ ] Update type imports to new names (`ISaveInvoicePayload`, `IUpdateInvoicePayload`)
- [ ] No functional or method signature changes
- [ ] Add `getLastUnitPrices` method if not already present: invokes `InvoicesIPC.GET_LAST_UNIT_PRICES`

**File:** `apps/desktop/src/renderer/src/services/suppliers/index.ts` (NEW)

- [ ] Import `SuppliersIPC` from `@shared/types/ipc`
- [ ] Import types `IUpsertSupplierPayload` from `@reyogo/types`
- [ ] Export `suppliersService` object with three methods calling the corresponding IPC channels

**File:** `apps/desktop/src/renderer/src/services/stockMovements/index.ts`

- [ ] No changes needed (IPC channel strings unchanged, return types match updated interfaces)

---

## Task 15: Fix renderer type errors

- [ ] Run: `pnpm --filter @reyogo/desktop run typecheck 2>&1 | head -80`
- [ ] For each error, identify if it's an `ICapturedInvoice*` rename or a removed field (`weightedAvgCost`, `totalStock`, `cogsAmount`, `costAtTime`, `source`)
- [ ] Fix by updating import names — **no logic changes**

Key files likely to have errors (grep for `ICapturedInvoice`, `costAtTime`, `cogsAmount`, `weightedAvgCost`, `totalStock`):
- `src/renderer/src/pages/Inventory/Invoice/hooks/useInvoiceForm/index.ts`
- `src/renderer/src/pages/Inventory/Invoice/History/hooks/useInvoiceHistory/index.ts`
- `src/renderer/src/pages/Inventory/Capture/CapturedInventory/hooks/useWeightedAvgCosts.ts`
- `src/renderer/src/pages/Inventory/Capture/CapturedInventory/hooks/useItemCosts.ts`
- `src/renderer/src/pages/Inventory/Capture/CapturedInventory/hooks/useItemStock/index.ts`
- `src/renderer/src/pages/Inventory/Costing/CostReport/index.tsx`
- `src/renderer/src/pages/Inventory/Costing/PriceVariance/index.tsx`
- `src/renderer/src/pages/Inventory/Analysis/hooks/useAnalysisData/index.ts`
- `src/renderer/src/pages/Inventory/Analysis/hooks/useAnalysisLines/index.ts`
- `apps/desktop/src/shared/types/ipc/invoke-map.ts` (should be clean after Task 8)

- [ ] Repeat `pnpm --filter @reyogo/desktop run typecheck` until zero errors
- [ ] Now remove the temporary type aliases added in Task 6 (`ICapturedInvoice = IInvoice` etc.) if they were added
- [ ] Run typecheck once more to confirm clean

---

## Task 16: Wipe dev DB and smoke test

- [ ] Delete dev database: `rm -f apps/desktop/.data/app-dev.db` (from repo root)
- [ ] Start app: `pnpm electron:dev`
- [ ] Verify startup reaches main view without errors
- [ ] Open DevTools console — zero unhandled errors
- [ ] Navigate: inventory list, invoice capture, invoice history, costing dashboard
- [ ] Create a test invoice with 2 lines, submit — verify no error
- [ ] Check invoice appears in history
- [ ] Verify DevTools shows no IPC errors

---

## Task 17: Final typecheck and commit

- [ ] Run from repo root: `pnpm run typecheck` — expected: zero errors across all packages
- [ ] Stage: `apps/desktop/src/main/`, `apps/desktop/src/shared/`, `lib/types/src/`, `apps/desktop/src/renderer/src/services/`, `apps/desktop/src/renderer/src/pages/` (changed files only)
- [ ] Commit: `feat: db redesign — stock movements ledger with WAC per movement`

---

## File change summary

| File | Action |
|------|--------|
| `apps/desktop/src/main/db/migrations/` (all) | Deleted + regenerated as single `0000` |
| `apps/desktop/src/main/db/drizzle/schema.ts` | Complete rewrite |
| `apps/desktop/src/main/dataAccess/invoices/index.ts` | Rewrite — WAC logic, new table names |
| `apps/desktop/src/main/dataAccess/stockMovements/index.ts` | Rewrite — new column names, updated queries |
| `apps/desktop/src/main/dataAccess/inventory/index.ts` | Remove WAC/stock cols from upsert |
| `apps/desktop/src/main/dataAccess/suppliers/index.ts` | **NEW** |
| `apps/desktop/src/main/handlers/invoices/index.ts` | Type rename only |
| `apps/desktop/src/main/handlers/suppliers/index.ts` | **NEW** |
| `apps/desktop/src/main/ipc.ts` | Wire in `registerSuppliersHandlers` |
| `apps/desktop/src/shared/types/ipc/suppliers.ts` | **NEW** |
| `apps/desktop/src/shared/types/ipc/index.ts` | Export `SuppliersIPC` |
| `apps/desktop/src/shared/types/ipc/invoke-map.ts` | Type renames + supplier entries |
| `lib/types/src/invoices/index.ts` | Rename `ICaptured*` → `I*` |
| `lib/types/src/stockMovements/index.ts` | Update field names, remove `StockMovementSource` |
| `lib/types/src/suppliers/index.ts` | **NEW** |
| `lib/types/src/index.ts` | Add suppliers export |
| `apps/desktop/src/renderer/src/services/invoice/index.ts` | Type rename |
| `apps/desktop/src/renderer/src/services/suppliers/index.ts` | **NEW** |
| `apps/desktop/src/renderer/src/pages/**` | Fix type errors from renames (no logic changes) |
