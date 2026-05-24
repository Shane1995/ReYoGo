# @reyogo/db — Database Reference

SQLite database layer for ReYoGo, a back-of-house costing and inventory system for a pub and restaurant. Uses Drizzle ORM with the libSQL client. All tables are scoped to an `account_id` to support future multi-tenancy, though the current single-site deployment uses a single `default` account.

## Technology

| Concern | Choice |
|---|---|
| Driver | `@libsql/client` (libSQL / SQLite) |
| ORM | Drizzle ORM v0.36 |
| Migrations | Drizzle Kit — auto-run on app startup |
| Schema source | `src/schema.ts` (single source of truth) |
| Dev database | `.data/app-dev.db` |

Generate a new migration after any schema change:

```bash
pnpm --filter @reyogo/db run db:generate
```

---

## Table Overview

```
accounts
  └── app_config              (global key-value store)
  └── units_of_measure
  └── inventory_categories    ── inventory_items
  └── suppliers               ──┐
  └── invoices ───────────────┘
        └── invoice_line_items  ──► stock_movements ◄── stock_count_sessions
        └── invoice_audit_log                               └── stock_count_lines
  └── costing_snapshots
```

---

## Tables

### `accounts`

Tenant boundary. Every other table carries an `account_id` FK to this table. The desktop app seeds a single `default` account on first run.

| Column | Type | Notes |
|---|---|---|
| `id` | text PK | |
| `name` | text | Display name |
| `is_current` | boolean | Which account is active |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

---

### `app_config`

Simple key-value store for application-level settings (e.g. setup completion flag). Not account-scoped.

| Column | Type | Notes |
|---|---|---|
| `key` | text PK | |
| `value` | text | JSON or plain string |

---

### `units_of_measure`

User-defined units (kg, L, each, bottle, keg, portion…). Currently stored here but not yet FK-linked to item columns — items store `unit_of_measure` as a plain text field.

| Column | Type | Notes |
|---|---|---|
| `id` | text PK | |
| `account_id` | text FK | → `accounts.id` |
| `name` | text | e.g. `"kg"`, `"750ml bottle"` |
| `created_at` | timestamp | |

---

### `inventory_categories`

Top-level grouping for inventory items. The `type` field drives cost reporting — food GP and wet GP are reported separately on a pub P&L.

| Column | Type | Notes |
|---|---|---|
| `id` | text PK | |
| `account_id` | text FK | → `accounts.id` |
| `name` | text | e.g. `"Spirits"`, `"Proteins"`, `"Dry Goods"` |
| `type` | text | `food`, `beverage`, or `non-food` — enforced by CHECK constraint |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

**`type` values:**

| Value | Used for |
|---|---|
| `food` | Kitchen ingredients — proteins, produce, dairy, dry goods, bakery |
| `beverage` | Wet stock — spirits, draught beer, packaged beer/cider, wine, soft drinks, hot drinks |
| `non-food` | Consumables — cleaning products, disposables, PPE |

---

### `inventory_items`

The ingredient/product master. Each item belongs to one category and inherits its `type`.

| Column | Type | Notes |
|---|---|---|
| `id` | text PK | |
| `account_id` | text FK | → `accounts.id` |
| `name` | text | e.g. `"Beef Mince"`, `"Jameson 70cl"` |
| `category_id` | text FK | → `inventory_categories.id` |
| `unit_of_measure` | text | Free text for now (e.g. `"kg"`, `"bottle"`) |
| `yield_factor` | real | `0.0–1.0`, default `1.0`. Edible/usable portion after prep. A whole salmon with 65% yield stores `0.65` — cost per usable kg = purchase price ÷ 0.65 |
| `par_level` | real | Target stock level to maintain (optional) |
| `reorder_point` | real | Stock level that triggers an order (optional) |
| `reorder_qty` | real | Standard order quantity (optional) |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

**Yield factor example:**

```
Whole chicken: purchase price £3.50/kg, yield_factor = 0.75
→ edible portion cost = £3.50 ÷ 0.75 = £4.67/kg
```

**Par level example for a pub:**

```
Lager keg (50L): par_level = 4, reorder_point = 2, reorder_qty = 4
→ when stock drops to 2 kegs, order 4 more
```

---

### `suppliers`

Supplier contact directory. Linked to invoices.

| Column | Type | Notes |
|---|---|---|
| `id` | text PK | |
| `account_id` | text FK | → `accounts.id` |
| `name` | text | Company name |
| `contact_name` | text | Optional |
| `phone` | text | Optional |
| `email` | text | Optional |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

---

### `invoices`

A supplier delivery note / purchase invoice. Creating or editing an invoice automatically triggers stock movements (see below).

| Column | Type | Notes |
|---|---|---|
| `id` | text PK | |
| `account_id` | text FK | → `accounts.id` |
| `supplier_id` | text FK | → `suppliers.id` ON DELETE SET NULL |
| `invoice_number` | text | Supplier's reference (optional) |
| `invoice_date` | timestamp | Date on the invoice (optional; used as `occurred_at` on stock movements) |
| `created_at` | timestamp | |
| `updated_at` | timestamp | Set on edit |

Index: `invoices_supplier_idx` on `supplier_id`.

---

### `invoice_line_items`

One row per ingredient/product on an invoice. Quantity and total cost (ex VAT) drive the WAC calculation.

| Column | Type | Notes |
|---|---|---|
| `id` | text PK | |
| `invoice_id` | text FK | → `invoices.id` ON DELETE CASCADE |
| `item_id` | text FK | → `inventory_items.id` ON DELETE RESTRICT |
| `item_name_snapshot` | text | Item name at time of invoicing — preserved if item is later renamed |
| `unit_of_measure` | text | UOM at time of invoicing |
| `quantity` | real | |
| `vat_mode` | text | `inclusive`, `exclusive`, or `non-taxable` |
| `vat_rate` | real | e.g. `0.20` for 20% |
| `total_vat_exclude` | real | Total line cost excluding VAT — used to derive `unit_cost = total_vat_exclude / quantity` |

Index: `invoice_lines_invoice_idx` on `invoice_id`.

Unit cost is always derived as `total_vat_exclude ÷ quantity` (never stored independently) to keep a single source of truth.

---

### `invoice_audit_log`

Full JSON snapshot of an invoice before each edit. Lets you reconstruct what an invoice looked like at any point in time.

| Column | Type | Notes |
|---|---|---|
| `id` | text PK | |
| `invoice_id` | text FK | → `invoices.id` ON DELETE CASCADE |
| `edited_at` | timestamp | |
| `note` | text | User-supplied edit reason (optional) |
| `snapshot` | text | JSON blob — full `IInvoiceWithLines` at time of edit |

---

### `stock_movements`

The core WAC ledger. Append-only — never updated after insert. Every stock event (purchase, consumption, adjustment, stocktake variance) writes a row here.

| Column | Type | Notes |
|---|---|---|
| `id` | text PK | |
| `account_id` | text FK | → `accounts.id` |
| `inventory_item_id` | text FK | → `inventory_items.id` ON DELETE RESTRICT |
| `movement_type` | text | See movement types below |
| `qty` | real | Positive = stock in, negative = stock out |
| `unit_cost_at_time` | real | Cost per unit at the time of this movement |
| `total_cost` | real | `qty × unit_cost_at_time` |
| `weighted_avg_cost_after` | real | Running WAC for this item after this movement |
| `stock_qty_after` | real | Running stock quantity after this movement |
| `reference_type` | text | `invoice`, `manual`, or `adjustment` |
| `reference_id` | text | ID of the source document (invoice ID, count session ID) |
| `notes` | text | Free text |
| `occurred_at` | timestamp | Business date of the movement (may differ from `created_at`) |
| `created_at` | timestamp | DB write time |

Indexes: `stock_movements_item_time_idx` on `(inventory_item_id, occurred_at)`, `stock_movements_ref_idx` on `(reference_type, reference_id)`.

**Movement types:**

| Type | Triggered by | Effect on stock |
|---|---|---|
| `IN` | Invoice line item saved | +qty, WAC recalculated |
| `OUT` | Manual consumption entry | −qty, WAC unchanged |
| `ADJUSTMENT` | Stock count session completed | ±variance qty, WAC unchanged |
| `WASTE` | Manual waste entry | −qty, WAC unchanged |
| `RETURN` | Manual return to supplier | −qty, WAC unchanged |

**WAC formula (weighted average cost):**

```
new WAC = (prev_qty × prev_wac + in_qty × unit_cost) / (prev_qty + in_qty)
```

WAC is only recalculated on `IN` movements. Out-movements (OUT, WASTE, RETURN, ADJUSTMENT) use the WAC from the previous `IN` as the cost of goods consumed.

---

### `costing_snapshots`

Periodic point-in-time snapshots of WAC and stock quantity per item. Used for period-end reporting without replaying the full movements ledger.

| Column | Type | Notes |
|---|---|---|
| `id` | text PK | |
| `account_id` | text FK | → `accounts.id` |
| `inventory_item_id` | text FK | → `inventory_items.id` ON DELETE RESTRICT |
| `snapshot_date` | timestamp | End of period |
| `weighted_avg_cost` | real | WAC at snapshot date |
| `stock_qty` | real | Stock quantity at snapshot date |
| `created_at` | timestamp | |

---

### `stock_count_sessions`

A physical stocktake event covering a date range. Created in `draft` status; transitions to `complete` when all counts are entered and confirmed.

| Column | Type | Notes |
|---|---|---|
| `id` | text PK | |
| `account_id` | text FK | → `accounts.id` |
| `period_start` | timestamp | Start of the period being counted |
| `period_end` | timestamp | End of the period being counted |
| `status` | text | `draft` or `complete` |
| `notes` | text | Optional notes (e.g. `"weekly spirits count"`) |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

---

### `stock_count_lines`

One row per item counted in a stocktake session. `book_qty` and `variance` are populated when the session is completed.

| Column | Type | Notes |
|---|---|---|
| `id` | text PK | |
| `session_id` | text FK | → `stock_count_sessions.id` ON DELETE CASCADE |
| `inventory_item_id` | text FK | → `inventory_items.id` ON DELETE RESTRICT |
| `counted_qty` | real | Physical count entered by staff |
| `book_qty` | real | System's expected qty (from latest stock movement) — set on completion |
| `variance` | real | `counted_qty − book_qty` — set on completion |
| `notes` | text | Optional per-line note |

Index: `count_lines_session_idx` on `session_id`.

**Completion flow:**

When `completeSession(id)` is called:
1. For each line, the latest `stock_qty_after` from `stock_movements` is read as `book_qty`.
2. `variance = counted_qty − book_qty` is calculated and stored on the line.
3. If `variance ≠ 0`, an `ADJUSTMENT` stock movement is created — the stock ledger is corrected to match physical reality.
4. Session status is set to `complete`.

WAC is not recalculated for adjustments — the existing cost value is preserved on the new movement. This is standard BOH accounting practice and avoids distorting the cost of goods already sold.

---

## Key Flows

### Invoice → Stock

```
User saves invoice
  └── For each line (quantity > 0):
        1. Read latest stock_movement for item → get current qty + WAC
        2. Calculate new WAC  =  (prev_qty × prev_wac + qty × unit_cost) / (prev_qty + qty)
        3. Insert stock_movement  (type=IN, reference_type=invoice, reference_id=invoice.id)

User edits invoice
  └── Snapshot current invoice → invoice_audit_log
  └── Delete old stock_movements for this invoice (reference_type=invoice, reference_id=invoice.id)
  └── Re-run the insert flow above with new lines
```

### Stocktake → Adjustment

```
Staff count stock → upsertLine() per item (countedQty)
Staff confirm count → completeSession()
  └── For each line:
        1. Read latest stock_movement → book_qty
        2. variance = countedQty − book_qty
        3. If variance ≠ 0:
              Insert stock_movement (type=ADJUSTMENT, reference_type=adjustment, reference_id=session.id)
        4. Update line with book_qty + variance
  └── Set session status = 'complete'
```

### COGS Calculation

```
getCOGS(fromDate?, toDate?)
  └── Sum (qty × unit_cost_at_time) for all OUT movements in date range
  └── Grouped by inventory_categories.name for food/beverage breakdown
```

---

## Repositories

| Module | Factory | Responsibilities |
|---|---|---|
| `repositories/inventory.ts` | `createInventoryRepo` | Category and item CRUD |
| `repositories/suppliers.ts` | `createSuppliersRepo` | Supplier CRUD |
| `repositories/invoices.ts` | `createInvoicesRepo` | Invoice save/update/query + WAC movement writes |
| `repositories/stockMovements.ts` | `createStockMovementsRepo` | Current stock, WAC, COGS query |
| `repositories/stockCounts.ts` | `createStockCountsRepo` | Count session lifecycle + completion |
| `repositories/setup.ts` | `createSetupRepo` | App config read/write |
