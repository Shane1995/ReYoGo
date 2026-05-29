# Multi-Entity Support: Business Groups & Venues

**Date:** 2026-05-29
**Branch:** feat/multi-entity-support
**Trello:** https://trello.com/c/TWfuh0MA/205-multi-entity-support-business-groups-venues

---

## Summary

Enable a single operator to run multiple legally separate trading entities (e.g. a pub and a gin bar) under one business group. Invoices, stock movements, and costs are correctly attributed per entity for operational reporting and VAT/tax purposes. Every invoice belongs to exactly one entity — the operator selects the entity when capturing an invoice and only sees items belonging to that entity. No mixed-entity invoices, no split logic.

---

## Domain Model

```
account → businessGroup → entity → items / invoices / movements
```

- **`account`** — auth/tenancy layer. Maps to Clerk organisation in the future web app. Unchanged.
- **`businessGroup`** — the operator's business umbrella (e.g. "The Crown Group"). Belongs to one account.
- **`entity`** — a legal trading entity (e.g. "The Crown Pub", "Gin on Tap"). Belongs to one group. Holds its own VAT configuration.
- Every `inventoryItem`, `invoice`, and `stockMovement` belongs to exactly one entity via a `NOT NULL` FK. No shared items, no null concept.

---

## Schema Changes

### New tables

```sql
business_groups
  id          TEXT PRIMARY KEY
  account_id  TEXT NOT NULL FK→accounts (CASCADE)
  name        TEXT NOT NULL
  created_at  INTEGER NOT NULL

entities
  id              TEXT PRIMARY KEY
  group_id        TEXT NOT NULL FK→business_groups (CASCADE)
  name            TEXT NOT NULL
  default_vat_rate  REAL NOT NULL DEFAULT 15
  default_vat_mode  TEXT NOT NULL DEFAULT 'exclusive'
  created_at      INTEGER NOT NULL
  archived_at     INTEGER
```

### Modified tables

```
inventory_items   + entity_id TEXT NOT NULL FK→entities (RESTRICT)
invoices          + entity_id TEXT NOT NULL FK→entities (RESTRICT)
stock_movements   + entity_id TEXT NOT NULL FK→entities (RESTRICT)
```

`invoices.vat_rate` and `invoices.vat_mode` remain as snapshot columns — stamped from the entity's settings at capture time. `vat_rate` is no longer user-input on the capture form; `vat_mode` remains an operator input (per-invoice override, defaults from entity setting).

`accounts` table is unchanged.

### Migration

Idempotent upserts — safe to run on fresh and existing installs:

```sql
INSERT OR IGNORE INTO business_groups (id, account_id, name, created_at)
  VALUES ('default-group', 'default', 'My Business', <now>);

INSERT OR IGNORE INTO entities (id, group_id, name, default_vat_rate, default_vat_mode, created_at)
  VALUES ('default-entity', 'default-group', 'My Venue', 15, 'exclusive', <now>);

UPDATE inventory_items  SET entity_id = 'default-entity' WHERE entity_id IS NULL;
UPDATE invoices         SET entity_id = 'default-entity' WHERE entity_id IS NULL;
UPDATE stock_movements  SET entity_id = 'default-entity' WHERE entity_id IS NULL;
```

---

## Setup Wizard

Runs once on first launch. Triggered by checking `entities.name = 'My Venue'` (placeholder still in place) or a `setupComplete` boolean on `accounts`.

Same flow for fresh installs and existing installs.

**Step 1 — Group name:** Single text field pre-filled from `accounts.name`. Operator confirms or edits.

**Step 2 — Entities:** List of entity name inputs. At least one required. Inline "Add another venue" input. Can remove any except the last. "Get started" disabled until at least one entity is named.

On completion: upserts the group name and creates/renames entities. Sets `setupComplete = true`. Never appears again.

---

## IPC Layer

### Channel constants (`apps/desktop/src/shared/types/ipc/entities.ts`)

```ts
export const EntitiesIPC = {
  GET_ENTITIES:  'entities:get-entities',
  CREATE_ENTITY: 'entities:create-entity',
  RENAME_ENTITY: 'entities:rename-entity',
  GET_GROUP:     'entities:get-group',
  UPDATE_GROUP:  'entities:update-group',
} as const;

export type EntitiesIPC = typeof EntitiesIPC[keyof typeof EntitiesIPC];
```

No enums. No magic strings. All IPC constants follow the existing `as const` object pattern.

### Types (`lib/types/src/entities/index.ts`)

```ts
interface IBusinessGroup {
  id: string;
  name: string;
}

interface IEntity {
  id: string;
  groupId: string;
  name: string;
  defaultVatRate: number;
  defaultVatMode: VatMode;
  archivedAt: Date | null;
}
```

### Layers

| Layer | Path |
|---|---|
| Repository | `lib/db/src/repositories/entities/index.ts` |
| Repository test | `lib/db/src/repositories/entities/index.test.ts` |
| IPC handler | `apps/desktop/src/main/handlers/entities/index.ts` |
| Renderer service | `apps/desktop/src/renderer/src/services/entities/index.ts` |
| Service test | `apps/desktop/src/renderer/src/services/entities/index.test.ts` |

`invoke-map.ts` updated with `EntitiesIPC` channels and their arg/return types.

`ISaveCapturedInvoicePayload` gains required `entityId: string`. No default — caller must provide it explicitly.

`stockMovement` insertion functions receive `entityId` explicitly from the invoice — never looked up from the item. `NOT NULL` DB constraint is the final backstop.

---

## Entity Context (`EntityContext`)

Wraps the app at the same level as `InventoryContext`. Loads entities and business group once on mount.

```ts
interface EntityContextValue {
  group: IBusinessGroup | null;
  entities: IEntity[];
  refetchEntities: () => Promise<void>;
}
```

`useEntities()` hook consumes the context. `refetchEntities()` is called after create/rename in Settings so invoice capture and item forms stay in sync without a restart.

Files:
- `apps/desktop/src/renderer/src/Context/EntityContext/index.tsx`
- `apps/desktop/src/renderer/src/Context/EntityContext/index.test.tsx`

---

## Settings Page

New top-level route: `/settings`.

Added to primary sidebar as a full nav item (`Settings` / `Settings` icon from Lucide), above the collapse toggle, separated by a top border. Consistent treatment with Dashboard, Stock, etc. Shows icon-only when sidebar is collapsed.

### Sections

**Business** — edit `businessGroups.name`.

**Entities** — list of active entities. Each row: colour-coded initial avatar, entity name, item count, Rename button. "Add entity" dashed button at the bottom. `archivedAt` column exists in schema but archive UI is out of scope for this card.

**Tax** — per-entity `defaultVatRate` (numeric input + %) and `defaultVatMode` (inclusive/exclusive toggle). Displayed under the selected entity's row or as a sub-section per entity if there are multiple.

**Units of measure** — existing units management surfaced here (currently only accessible via the setup flow).

After any create/rename: calls `refetchEntities()`.

Files:
- `apps/desktop/src/renderer/src/pages/Settings/index.tsx`
- Sub-components under `pages/Settings/components/`

---

## Invoice Capture Changes

### Entity selector

Added to `InvoiceHeader`. Required. Defaults to the last-used entity (persisted in `localStorage`). Populated from `EntityContext`.

### Item autocomplete filtering

`ItemAutocomplete` filters items by the selected entity's `entityId`. Only items belonging to the selected entity are shown.

### Changing entity mid-capture

If `isDirty` (lines exist), changing the entity selector shows a confirmation dialog: *"Changing entity will clear your current lines. Continue?"* On confirm, lines reset and autocomplete re-filters.

### VAT handling

`vatRate` removed from capture form UI. Read from `entity.defaultVatRate` at save time and snapshotted onto the invoice row. `vatMode` stays as an operator input on the form, defaulting to `entity.defaultVatMode`, overrideable per invoice.

### Draft persistence

`entityId` included in draft state.

### `useInvoiceForm` changes

Adds `entityId` to state. Passes it through to `ISaveCapturedInvoicePayload`. All tests updated.

---

## Inventory & Reports Filtering

### Reusable `EntityFilter` component

Pill-style filter: "All entities" (default) + one pill per active entity. Used on inventory table, invoice history, and report pages.

Files:
- `apps/desktop/src/renderer/src/components/EntityFilter/index.tsx`
- `apps/desktop/src/renderer/src/components/EntityFilter/index.test.tsx`

### Surfaces

| Surface | Change |
|---|---|
| Inventory items table | `EntityFilter` alongside existing filters |
| Invoice History | `EntityFilter` alongside existing filters |
| COGS / Cost reports | `EntityFilter` — single entity shows that entity's data; "All" shows consolidated totals with per-entity breakdown |

### WAC

No changes to `calculateWAC`. Since each item belongs to exactly one entity, all movements for an item are inherently scoped to that entity — WAC is naturally per-entity.

---

## Item Forms

`AddItemModal` and `EditItemDialog` gain a required "Belongs to" entity dropdown. Populated from `EntityContext`. Save is blocked until an entity is selected.

CSV import (`reyogo-import-template.xlsx`) gains a required `Entity` column. Import validation resolves entity by name — rows with unrecognised entity names are rejected with a per-row error before the import is committed. `FormatGuide` component updated. Import preview shows resolved entity per row.

---

## Delivery Sequence (Thin Vertical Slice)

1. Schema + migration (idempotent upserts, all existing rows stamped)
2. IPC layer + `EntityContext`
3. Settings page (group name, entities, VAT config per entity, units of measure)
4. Setup wizard (one-off, same flow for fresh and existing installs)
5. "Belongs to" field on Add/Edit Item forms
6. Entity selector on invoice capture + filtered item autocomplete
7. `EntityFilter` on inventory table and invoice history
8. Reports entity filtering + per-entity breakdown
9. CSV import template + validation update

---

## Key Constraints

- `entityId` on `stockMovements` is always stamped from the invoice — never derived from the item. `NOT NULL` DB constraint is the final backstop.
- WAC must never be blended across entities. Since items are hard-assigned to one entity this is guaranteed by the data model.
- The two `saveInvoice()` calls during any future multi-invoice operation must always be wrapped in a single DB transaction.
- No `as` type casts anywhere. IPC enums → `as const` objects. DB column types → `.$type<T>()`. Fix the types at source.
- Every new artifact: `<dir>/<Name>/index.ts[x]` + co-located `<dir>/<Name>/index.test.ts[x]`. No exceptions.
- No code comments.

---

## Out of Scope

- Archive entity UI (column exists, no UI)
- Intercompany transactions / internal recharges
- Cross-entity stock transfers
- Per-entity user permissions
- Formal financial statement generation per entity
- Shared items with null entityId
