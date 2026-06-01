# Group-Scoped Inventory Items & Entity-Scoped Suppliers

**Date:** 2026-06-01

## Context

ReYoGo supports a two-level data model: one `business_groups` row (the umbrella) containing multiple `entities` (individual businesses). The real-world user has a pub/restaurant and a gin distribution company under one group — one operator managing both. They share inventory item definitions (same product catalog) but run completely separate supplier relationships and maintain separate physical stock in each business.

The current schema has the model backwards: `inventory_items` has a `NOT NULL entityId` column (scoped per business) and `suppliers` has only a `groupId` (shared across all businesses). This is the inverse of what the domain requires.

## Domain Model

**Items are group-scoped** — "Hendricks Gin 70cl" is defined once at group level. Both businesses share the catalog. This avoids defining the same product twice and keeps item definitions consistent across the group. This is the standard multi-location hospitality pattern.

**Stock is entity-scoped** — `stock_movements` already has `entityId`. The pub holds 20 bottles; the gin company holds 5,000. They are tracked separately via movements. Item definitions are shared; stock quantities are not.

**Suppliers are entity-scoped** — the pub's food and beer suppliers have nothing to do with the gin company's botanical suppliers. Suppliers belong to one entity. Minor accepted cost: if a single real-world company supplies both entities, two supplier records will exist. Manageable for a small group.

## What Changes

### 1. Schema

**`inventory_items`**
- Remove `entityId` column (currently `NOT NULL`, FK → entities with `onDelete: 'restrict'`)
- Change unique index from `(entityId, name)` → `(groupId, name)`, named `inventory_items_name_group_idx`

**`suppliers`**
- Remove `groupId` column
- Add `entityId` column: `NOT NULL`, FK → entities with `onDelete: 'cascade'`
- Add unique index `(entityId, name)`, named `suppliers_name_entity_idx`

**Migration:** regenerate via `pnpm --filter @reyogo/db run db:generate`. Replaces the existing `0000_` migration — no live data, safe to squash.

### 2. Shared Types (`lib/types`)

- `InventoryItem`: remove `entityId` field
- `IInventoryItem`: remove `entityId` field
- `InventoryItemInput`: follows automatically (it's `Omit<InventoryItem, ...>`)
- `UpsertSupplierPayload`: add `entityId: string`

### 3. Inventory Repository (`lib/db/src/repositories/inventory/index.ts`)

`getItems(entityId?: string)` changes behaviour — the signature stays but what it filters changes:

| | Before | After |
|---|---|---|
| Items returned | Only that entity's items (`WHERE items.entityId = ?`) | All group items (no items filter) |
| Stock qty (with entityId) | From that entity's movements | From that entity's movements only |
| Stock qty (no entityId) | All movements, global latest-wins | Latest per entity per item, then summed |

The stock movement query must change for both modes:
- **With entityId**: filter `stockMovements.entityId = entityId`, then take latest movement per item
- **Without entityId (aggregate)**: take latest movement per `(inventoryItemId, entityId)` pair, then `SUM(stockQtyAfter)` per item. Requires a subquery or CTE — cannot use the current global-latest loop.

`upsertItem(item: InventoryItemInput, groupId: string)` — remove `entityId` from insert/update values (column no longer exists).

`getArchivedItems()` — same movement query fix as `getItems` (no entity filter; returns all group archived items with aggregate stock).

All other item methods (`archiveItem`, `restoreItem`, `hardDeleteItem`, etc.) — no change needed.

### 4. Stock Movements Repository (`lib/db/src/repositories/stockMovements/index.ts`)

Same pattern: optional `entityId` → per-entity when provided, aggregate when not.

`getCurrentStockByItem(entityId?: string)`:
- With entityId: filter movements by entity, take latest per item
- Without: latest per `(inventoryItemId, entityId)`, then sum per item

`getWeightedAvgCosts(entityId?: string)`:
- With entityId: filter `IN` movements by entity, take latest WAC per item
- Without: take latest `IN` movement per `(inventoryItemId, entityId)`, weighted average by quantity

`getCOGS(fromDate?, toDate?, entityId?)`:
- Move the entity filter from `inventoryItems.entityId` (column being removed) to `stockMovements.entityId`
- No signature change needed

`getItemCostHistory(itemId: string, entityId?: string)`:
- With entityId: filter movements to that entity only
- Without: all movements across all entities (current behaviour, but now meaningful across entities)

`getMovementsForItem(itemId: string)` — no change needed (movement-level detail, entity shown per row).

### 5. Invoices Repository (`lib/db/src/repositories/invoices/index.ts`)

`getLinesForAnalysis(entityId?: string)`:
- Add optional entity filter via `invoices.entityId`
- This is a prerequisite for Card #208 (Price Analysis entity scoping) — see Trello card dependency

`getLastUnitPrices()` — no change needed (used for invoice pre-fill, not analysis).

### 6. Suppliers Repository (`lib/db/src/repositories/suppliers/index.ts`)

`getSuppliers(entityId: string)` — filter by `suppliers.entityId`. No aggregate mode needed (suppliers are strictly per-entity).

`upsertSupplier(payload: UpsertSupplierPayload, entityId: string)` — insert/update uses `entityId` instead of `groupId`.

`deleteSupplier(id: string)` — unchanged.

### 7. IPC Handlers

**Inventory** (`apps/desktop/src/main/handlers/inventory/index.ts`):
- `UPSERT_ITEM`: stop passing `entityId` from payload (column no longer exists)
- All other handlers: unchanged

**Suppliers** (`apps/desktop/src/main/handlers/suppliers/index.ts`):
- `GET_SUPPLIERS`: read `entityId` from IPC payload; call `getSuppliers(payload.entityId)`
- `UPSERT_SUPPLIER`: `payload` now includes `entityId`; call `upsertSupplier(payload, payload.entityId)`
- `DELETE_SUPPLIER`: unchanged

**Stock Movements** (`apps/desktop/src/main/handlers/stockMovements/index.ts`):
- `GET_CURRENT_STOCK`, `GET_WEIGHTED_AVG_COSTS`: read optional `entityId` from payload; pass through
- `GET_COGS`: already accepts optional `entityId`; fix filter location in repo (no handler change)
- `GET_ITEM_COST_HISTORY`: read optional `entityId` from payload; pass through

### 8. `invoke-map.ts`

Update the following IPC channel type signatures:
- `'suppliers:get-suppliers'`: `args: []` → `args: [entityId: string]`
- `'stock-movements:get-current-stock'`: `args: []` → `args: [entityId?: string]`
- `'stock-movements:get-weighted-avg-costs'`: `args: []` → `args: [entityId?: string]`
- `'stock-movements:get-item-cost-history'`: `args: [itemId: string]` → `args: [itemId: string, entityId?: string]`
- Add `'invoices:get-lines-for-analysis'` optional entityId: `args: [entityId?: string]`

### 9. Renderer — Supplier Service & Callers

`suppliersService.getSuppliers(entityId: string)` — passes entityId as IPC arg.

Four call sites in the renderer must pass `entityId`:
- `pages/Invoices/index.tsx` — has `entityId` from `useInvoiceForm()`
- `pages/Inventory/Invoice/index.tsx` — same
- `pages/Invoices/History/hooks/useInvoiceHistory/index.ts` — cross-entity history view; use `useEntities()` to get all entity IDs, call `getSuppliers(entityId)` for each, merge results
- `pages/Inventory/Invoice/History/hooks/useInvoiceHistory/index.ts` — same pattern

Test files mocking `getSuppliers` (`useInvoiceHistory/index.test.ts` in both paths) must accept an `entityId` arg.

### 10. Renderer — AddInventoryPage & AddItemsPage

These pages currently have an entity selector (`venueId` state variable) used to:
1. Set `entityId` on new items — obsolete (items are group-scoped)
2. Filter existing items by entity for duplicate detection — obsolete (dedup against full group catalog)

**The entity selector is removed entirely from both pages.** Duplicate detection checks against all group items. No other logic changes needed on these pages.

### 11. UI Labels: "venues" → "businesses"

Replace all user-facing string literals in `apps/desktop/src/renderer/src`. Variable names (e.g. `venueId`) are not renamed — only visible strings.

Files to update:
- `pages/SetupWizard/index.tsx`
- `pages/SetupWizard/components/EntitiesStep/index.tsx`
- `pages/SetupWizard/components/GroupStep/index.tsx`
- `pages/Settings/index.tsx`
- `pages/Settings/components/EntitiesSection/index.tsx`
- `pages/Settings/components/TaxSection/index.tsx`
- `pages/Invoices/components/InvoiceHeader/index.tsx`
- `pages/Inventory/Invoice/components/InvoiceHeader/index.tsx`
- `pages/Inventory/Capture/CapturedInventory/ImportPage/index.tsx`
- `pages/Inventory/Capture/CapturedInventory/components/ItemsTable/index.tsx`
- `pages/Inventory/Manage/index.tsx`

### 12. Tests

**`lib/db/src/__tests__/helpers.ts`** — no `entityId` on `inventoryItems` seed inserts (none currently, nothing to change).

**`lib/db/src/repositories/inventory/index.test.ts`** — remove `entityId` from all item seed objects and assertions throughout.

**`lib/db/src/repositories/suppliers/index.test.ts`** — change `groupId` → `entityId` (`'default'`) in all `upsertSupplier` calls; add `entityId` arg to all `getSuppliers()` calls.

**`lib/db/src/repositories/stockMovements/index.test.ts`** — update `getCurrentStockByItem` and `getWeightedAvgCosts` tests to cover both entity-scoped and aggregate paths.

**`lib/db/src/repositories/invoices/index.test.ts`** — remove `entityId` from inline `inventoryItems` seed inserts.

## Downstream Card Impact

| Card | Impact | Action taken |
|---|---|---|
| [#208 Price Analysis](https://trello.com/c/yQ3oOZzJ) | `getLinesForAnalysis(entityId?)` is a hard prerequisite for Phase 2 entity scoping | Dependency added to card |
| [#217 Return to Supplier](https://trello.com/c/AFkF4Vuz) | Suppliers are entity-scoped; return UI must call `getSuppliers(invoice.entityId)` | Card updated |
| [#218 Manufacturing Receipt](https://trello.com/c/SEH2hNJh) | Items come from group catalog (not entity-specific); movements are entity-scoped as before | No card change needed |
| [#216 Waste & Write-off](https://trello.com/c/Z9K5Ss1X) | Item picker widens to all group items; movements remain entity-scoped | No card change needed |

## Quality Rules

- No `as` type assertions
- No magic strings — use named constants
- No code comments
- All changes must pass `pnpm run test` and `pnpm run typecheck`

## Implementation Order

1. Schema changes (`inventoryItems`, `suppliers`)
2. Regenerate migration (`pnpm --filter @reyogo/db run db:generate`)
3. Shared types (`lib/types`)
4. Inventory repository — schema column removal + `getItems` query rewrite
5. Stock movements repository — optional entityId on all query methods
6. Invoices repository — optional entityId on `getLinesForAnalysis`
7. Suppliers repository — entity-scoped insert/query
8. `invoke-map.ts` — update IPC type signatures
9. IPC handlers (inventory, suppliers, stock movements)
10. Renderer supplier service + four call sites
11. Renderer `AddInventoryPage` + `AddItemsPage` — remove entity selector
12. UI label replacements ("venues" → "businesses")
13. Test updates across all affected test files
14. `pnpm run test` + `pnpm run typecheck` — must pass clean
