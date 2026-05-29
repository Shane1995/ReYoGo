# Multi-Entity Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add business group and entity support so every invoice, item, and stock movement is attributed to exactly one legal trading entity, with filtering across all surfaces and a one-off setup wizard.

**Architecture:** Schema-first thin vertical slice — foundation (schema + IPC + context + settings + wizard) is built and working end-to-end before any surface changes. Each task produces committed, tested code. All new files follow `<dir>/<Name>/index.ts[x]` + co-located `index.test.ts[x]`. No `as` casts. No code comments.

**Tech Stack:** Drizzle ORM (SQLite/libsql), Electron IPC, React Context, Vitest, React Testing Library, Tailwind CSS, shadcn/ui, Lucide React.

---

## File Map

### New files
| Path | Responsibility |
|---|---|
| `lib/db/src/schema/businessGroups/index.ts` | Drizzle table definition for `business_groups` |
| `lib/db/src/schema/entities/index.ts` | Drizzle table definition for `entities` |
| `lib/db/src/repositories/entities/index.ts` | Pure Drizzle queries for groups + entities |
| `lib/db/src/repositories/entities/index.test.ts` | Repo unit tests |
| `lib/types/src/entities/index.ts` | `IBusinessGroup`, `IEntity` types |
| `apps/desktop/src/shared/types/ipc/entities.ts` | `EntitiesIPC` channel constants |
| `apps/desktop/src/main/handlers/entities/index.ts` | `ipcMain.handle` wrappers |
| `apps/desktop/src/renderer/src/services/entities/index.ts` | Renderer-side `ipcRenderer.invoke` wrappers |
| `apps/desktop/src/renderer/src/services/entities/index.test.ts` | Service unit tests |
| `apps/desktop/src/renderer/src/Context/EntityContext/index.tsx` | `EntityContext` + `useEntities` hook |
| `apps/desktop/src/renderer/src/Context/EntityContext/index.test.tsx` | Context unit tests |
| `apps/desktop/src/renderer/src/pages/Settings/index.tsx` | Settings page root |
| `apps/desktop/src/renderer/src/pages/Settings/components/BusinessSection/index.tsx` | Group name editor |
| `apps/desktop/src/renderer/src/pages/Settings/components/BusinessSection/index.test.tsx` | |
| `apps/desktop/src/renderer/src/pages/Settings/components/EntitiesSection/index.tsx` | Entity list + add + rename |
| `apps/desktop/src/renderer/src/pages/Settings/components/EntitiesSection/index.test.tsx` | |
| `apps/desktop/src/renderer/src/pages/Settings/components/TaxSection/index.tsx` | Per-entity VAT config |
| `apps/desktop/src/renderer/src/pages/Settings/components/TaxSection/index.test.tsx` | |
| `apps/desktop/src/renderer/src/pages/SetupWizard/index.tsx` | Wizard shell + step router |
| `apps/desktop/src/renderer/src/pages/SetupWizard/components/GroupStep/index.tsx` | Step 1 — group name |
| `apps/desktop/src/renderer/src/pages/SetupWizard/components/EntitiesStep/index.tsx` | Step 2 — entity names |
| `apps/desktop/src/renderer/src/pages/SetupWizard/hooks/useSetupWizard/index.ts` | Wizard state + submit |
| `apps/desktop/src/renderer/src/pages/SetupWizard/hooks/useSetupWizard/index.test.ts` | |
| `apps/desktop/src/renderer/src/components/EntityFilter/index.tsx` | Reusable entity filter pills |
| `apps/desktop/src/renderer/src/components/EntityFilter/index.test.tsx` | |

### Modified files
| Path | Change |
|---|---|
| `lib/db/src/schema/accounts/index.ts` | Add `setupComplete` boolean column |
| `lib/db/src/schema/inventoryItems/index.ts` | Add `entityId` NOT NULL FK |
| `lib/db/src/schema/invoices/index.ts` | Add `entityId` NOT NULL FK |
| `lib/db/src/schema/stockMovements/index.ts` | Add `entityId` NOT NULL FK |
| `lib/db/src/schema/index.ts` | Export new schemas |
| `lib/db/src/repositories/invoices/index.ts` | Accept + stamp `entityId` on all write operations |
| `lib/db/src/repositories/inventory/index.ts` | Accept optional `entityId` filter on `getItems` |
| `lib/db/src/__tests__/helpers.ts` | Seed default group + entity after migration |
| `lib/db/src/index.ts` | Export `createEntitiesRepo` |
| `lib/types/src/invoices/index.ts` | Add `entityId` to `ISaveCapturedInvoicePayload` |
| `lib/types/src/index.ts` | Export entities types |
| `apps/desktop/src/shared/types/ipc/entities.ts` | (new — see above) |
| `apps/desktop/src/shared/types/ipc/index.ts` | Export `EntitiesIPC` |
| `apps/desktop/src/shared/types/ipc/invoke-map.ts` | Add entities channels |
| `apps/desktop/src/main/db/index.ts` | Init entities repo; upsert default group+entity |
| `apps/desktop/src/main/ipc.ts` | Register entities handler |
| `apps/desktop/src/renderer/src/components/App/index.tsx` | Wrap with `EntityContext` |
| `apps/desktop/src/renderer/src/components/AppLoader/index.tsx` | Show wizard if `!setupComplete` |
| `apps/desktop/src/renderer/src/components/AppLoader/hooks/useAppReady/index.ts` | Fetch `setupComplete` after DB ready |
| `apps/desktop/src/renderer/src/config/app.config.ts` | Add settings route + nav item |
| `apps/desktop/src/renderer/src/components/AppRoutes/routes.tsx` | Add Settings route + wizard route |
| `apps/desktop/src/renderer/src/components/AppRoutes/routePaths/index.ts` | Add `SettingsRoutes` |
| `apps/desktop/src/renderer/src/components/AppSidebar/index.tsx` | Settings nav item above collapse toggle |
| `apps/desktop/src/renderer/src/pages/Inventory/Invoice/hooks/useInvoiceForm/index.ts` | Add entityId + VAT rate from entity |
| `apps/desktop/src/renderer/src/pages/Inventory/Invoice/components/InvoiceHeader/index.tsx` | Entity selector |
| `apps/desktop/src/renderer/src/pages/Inventory/Invoice/components/ItemAutocomplete/index.tsx` | Filter by entityId |
| `apps/desktop/src/renderer/src/pages/Inventory/Capture/CapturedInventory/components/AddItemModal/index.tsx` | Add entity dropdown |
| `apps/desktop/src/renderer/src/pages/Inventory/Capture/CapturedInventory/components/EditItemDialog/index.tsx` | Add entity dropdown |
| `apps/desktop/src/renderer/src/pages/Inventory/Capture/CapturedInventory/index.tsx` | EntityFilter |
| `apps/desktop/src/renderer/src/pages/Inventory/Invoice/History/index.tsx` | EntityFilter |
| `apps/desktop/src/renderer/src/pages/Inventory/Costing/Dashboard/index.tsx` | EntityFilter |
| `apps/desktop/src/renderer/src/pages/Inventory/Costing/CostReport/index.tsx` | EntityFilter |
| `apps/desktop/src/renderer/src/components/CsvImport/parser/index.ts` | Parse + validate Entity column |
| `apps/desktop/src/renderer/src/pages/Inventory/Capture/CapturedInventory/ImportPage/components/FormatGuide/index.tsx` | Document Entity column |

---

## Task 1: DB schema — businessGroups + entities tables

**Files:**
- Create: `lib/db/src/schema/businessGroups/index.ts`
- Create: `lib/db/src/schema/entities/index.ts`
- Modify: `lib/db/src/schema/index.ts`

- [ ] **Step 1: Create businessGroups schema**

```ts
// lib/db/src/schema/businessGroups/index.ts
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { accounts } from '../accounts';

export const businessGroups = sqliteTable('business_groups', {
  id: text('id').primaryKey(),
  accountId: text('account_id')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
export type BusinessGroupRow = typeof businessGroups.$inferSelect;
export type NewBusinessGroupRow = typeof businessGroups.$inferInsert;
```

- [ ] **Step 2: Create entities schema**

```ts
// lib/db/src/schema/entities/index.ts
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { businessGroups } from '../businessGroups';

export const entities = sqliteTable('entities', {
  id: text('id').primaryKey(),
  groupId: text('group_id')
    .notNull()
    .references(() => businessGroups.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  defaultVatRate: integer('default_vat_rate').notNull().default(15),
  defaultVatMode: text('default_vat_mode').notNull().default('exclusive'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  archivedAt: integer('archived_at', { mode: 'timestamp' }),
});
export type EntityRow = typeof entities.$inferSelect;
export type NewEntityRow = typeof entities.$inferInsert;
```

- [ ] **Step 3: Export from schema index**

Add to `lib/db/src/schema/index.ts`:
```ts
export * from './businessGroups';
export * from './entities';
```

- [ ] **Step 4: Commit**
```bash
git add lib/db/src/schema/businessGroups/index.ts lib/db/src/schema/entities/index.ts lib/db/src/schema/index.ts
git commit -m "feat(db): add businessGroups and entities schema tables"
```

---

## Task 2: DB schema — add entityId + setupComplete to existing tables

**Files:**
- Modify: `lib/db/src/schema/accounts/index.ts`
- Modify: `lib/db/src/schema/inventoryItems/index.ts`
- Modify: `lib/db/src/schema/invoices/index.ts`
- Modify: `lib/db/src/schema/stockMovements/index.ts`

- [ ] **Step 1: Add setupComplete to accounts**

```ts
// lib/db/src/schema/accounts/index.ts
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  isCurrent: integer('is_current', { mode: 'boolean' }).notNull().default(false),
  setupComplete: integer('setup_complete', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
```

- [ ] **Step 2: Add entityId to inventoryItems**

```ts
// lib/db/src/schema/inventoryItems/index.ts
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { accounts } from '../accounts';
import { entities } from '../entities';
import { inventoryCategories } from '../inventoryCategories';
import { unitsOfMeasure } from '../unitsOfMeasure';

export const inventoryItems = sqliteTable('inventory_items', {
  id: text('id').primaryKey(),
  accountId: text('account_id')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  entityId: text('entity_id')
    .notNull()
    .references(() => entities.id, { onDelete: 'restrict' }),
  name: text('name').notNull(),
  categoryId: text('category_id')
    .notNull()
    .references(() => inventoryCategories.id, { onDelete: 'cascade' }),
  unitOfMeasureId: text('unit_of_measure_id').references(() => unitsOfMeasure.id, {
    onDelete: 'set null',
  }),
  sku: text('sku'),
  reorderPoint: real('reorder_point'),
  reorderQty: real('reorder_qty'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});
export type InventoryItemRow = typeof inventoryItems.$inferSelect;
export type NewInventoryItemRow = typeof inventoryItems.$inferInsert;
```

- [ ] **Step 3: Add entityId to invoices**

```ts
// lib/db/src/schema/invoices/index.ts
import { check, index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { accounts } from '../accounts';
import { entities } from '../entities';
import { suppliers } from '../suppliers';

export const invoices = sqliteTable(
  'invoices',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    entityId: text('entity_id')
      .notNull()
      .references(() => entities.id, { onDelete: 'restrict' }),
    supplierId: text('supplier_id').references(() => suppliers.id, { onDelete: 'set null' }),
    invoiceNumber: text('invoice_number'),
    invoiceDate: integer('invoice_date', { mode: 'timestamp' }),
    status: text('status').notNull().default('DRAFT'),
    vatMode: text('vat_mode').notNull().default('exclusive'),
    vatRate: real('vat_rate').notNull().default(15),
    totalExclTax: real('total_excl_tax').notNull().default(0),
    taxAmount: real('tax_amount').notNull().default(0),
    totalInclTax: real('total_incl_tax').notNull().default(0),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }),
  },
  (t) => ({
    invoicesBySupplier: index('invoices_supplier_idx').on(t.supplierId),
    invoicesByEntity: index('invoices_entity_idx').on(t.entityId),
    statusCheck: check('invoices_status_check', sql`${t.status} IN ('DRAFT', 'POSTED')`),
  }),
);
export type InvoiceRow = typeof invoices.$inferSelect;
export type NewInvoiceRow = typeof invoices.$inferInsert;
```

- [ ] **Step 4: Add entityId to stockMovements**

```ts
// lib/db/src/schema/stockMovements/index.ts
import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import type { MovementType, ReferenceType } from '@reyogo/types';
import { accounts } from '../accounts';
import { entities } from '../entities';
import { inventoryItems } from '../inventoryItems';

export const stockMovements = sqliteTable(
  'stock_movements',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    entityId: text('entity_id')
      .notNull()
      .references(() => entities.id, { onDelete: 'restrict' }),
    inventoryItemId: text('inventory_item_id')
      .notNull()
      .references(() => inventoryItems.id, { onDelete: 'restrict' }),
    movementType: text('movement_type').$type<MovementType>().notNull(),
    qty: real('qty').notNull(),
    unitCostAtTime: real('unit_cost_at_time'),
    totalCost: real('total_cost'),
    weightedAvgCostAfter: real('weighted_avg_cost_after'),
    stockQtyAfter: real('stock_qty_after').notNull(),
    referenceType: text('reference_type').$type<ReferenceType>(),
    referenceId: text('reference_id'),
    notes: text('notes'),
    occurredAt: integer('occurred_at', { mode: 'timestamp' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  },
  (t) => ({
    stockMovementsByItemTime: index('stock_movements_item_time_idx').on(
      t.inventoryItemId,
      t.occurredAt,
    ),
    stockMovementsByRef: index('stock_movements_ref_idx').on(t.referenceType, t.referenceId),
    stockMovementsByEntity: index('stock_movements_entity_idx').on(t.entityId),
  }),
);
export type StockMovementRow = typeof stockMovements.$inferSelect;
export type NewStockMovementRow = typeof stockMovements.$inferInsert;
```

- [ ] **Step 5: Commit**
```bash
git add lib/db/src/schema/
git commit -m "feat(db): add entityId to items/invoices/movements, setupComplete to accounts"
```

---

## Task 3: Generate Drizzle migration

**Files:**
- Create: `lib/db/migrations/0006_multi_entity.sql` (auto-generated)
- Modify: `lib/db/migrations/meta/_journal.json` (auto-updated)

- [ ] **Step 1: Generate migration**
```bash
pnpm --filter @reyogo/db run db:generate
```
Expected: new file `lib/db/migrations/0006_*.sql` created.

- [ ] **Step 2: Verify migration SQL**

Open the generated file and confirm it contains:
- `CREATE TABLE business_groups`
- `CREATE TABLE entities`
- `ALTER TABLE accounts ADD COLUMN setup_complete`
- `ALTER TABLE inventory_items ADD COLUMN entity_id`
- `ALTER TABLE invoices ADD COLUMN entity_id`
- `ALTER TABLE stock_movements ADD COLUMN entity_id`

- [ ] **Step 3: Add idempotent seed + backfill to the migration**

Append to the generated SQL file (after the last `-->` statement):
```sql
INSERT OR IGNORE INTO business_groups (id, account_id, name, created_at)
  VALUES ('default-group', 'default', 'My Business', strftime('%s', 'now') * 1000);

INSERT OR IGNORE INTO entities (id, group_id, name, default_vat_rate, default_vat_mode, created_at)
  VALUES ('default-entity', 'default-group', 'My Venue', 15, 'exclusive', strftime('%s', 'now') * 1000);

UPDATE inventory_items SET entity_id = 'default-entity' WHERE entity_id IS NULL;
UPDATE invoices SET entity_id = 'default-entity' WHERE entity_id IS NULL;
UPDATE stock_movements SET entity_id = 'default-entity' WHERE entity_id IS NULL;
```

- [ ] **Step 4: Update test helper to seed group + entity**

```ts
// lib/db/src/__tests__/helpers.ts
import { migrate } from 'drizzle-orm/libsql/migrator';
import { join } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';
import { createDbClient, type DbClient } from '../client';
import * as schema from '../schema';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export async function createTestDb(): Promise<DbClient> {
  const tmpPath = join(
    tmpdir(),
    `reyogo-test-${Date.now()}-${Math.random().toString(36).slice(2)}.db`,
  );
  const db = createDbClient(`file:${tmpPath}`);
  await migrate(db, {
    migrationsFolder: join(__dirname, '../../migrations'),
  });
  const now = new Date();
  await db.insert(schema.accounts).values({
    id: 'default',
    name: 'Default',
    isCurrent: true,
    setupComplete: false,
    createdAt: now,
    updatedAt: now,
  });
  await db.insert(schema.businessGroups).values({
    id: 'default-group',
    accountId: 'default',
    name: 'Test Group',
    createdAt: now,
  });
  await db.insert(schema.entities).values({
    id: 'default-entity',
    groupId: 'default-group',
    name: 'Test Entity',
    defaultVatRate: 15,
    defaultVatMode: 'exclusive',
    createdAt: now,
  });
  return db;
}

export type { DbClient } from '../client';
```

- [ ] **Step 5: Run existing tests to verify no regressions**
```bash
pnpm --filter @reyogo/db run test
```
Expected: all tests pass.

- [ ] **Step 6: Commit**
```bash
git add lib/db/migrations/ lib/db/src/__tests__/helpers.ts
git commit -m "feat(db): migration 0006 — multi-entity schema with idempotent seed"
```

---

## Task 4: lib/types — IBusinessGroup + IEntity

**Files:**
- Create: `lib/types/src/entities/index.ts`
- Modify: `lib/types/src/invoices/index.ts`
- Modify: `lib/types/src/index.ts`

- [ ] **Step 1: Create entities types**

```ts
// lib/types/src/entities/index.ts
import type { VatMode } from '../invoices';

export interface IBusinessGroup {
  id: string;
  name: string;
}

export interface IEntity {
  id: string;
  groupId: string;
  name: string;
  defaultVatRate: number;
  defaultVatMode: VatMode;
  archivedAt: Date | null;
}

export interface ICompleteSetupPayload {
  groupName: string;
  entityNames: string[];
}
```

- [ ] **Step 2: Add entityId to ISaveCapturedInvoicePayload**

In `lib/types/src/invoices/index.ts`, find `ISaveInvoicePayload` and add `entityId`:
```ts
export interface ISaveInvoicePayload {
  id: string;
  entityId: string;
  supplierId?: string | null;
  invoiceNumber?: string | null;
  invoiceDate?: Date | null;
  vatMode: VatMode;
  vatRate: number;
  lines: IInvoiceLinePayload[];
}
```

- [ ] **Step 3: Export from types index**

Add to `lib/types/src/index.ts`:
```ts
export type { IBusinessGroup, IEntity, ICompleteSetupPayload } from './entities';
```

- [ ] **Step 4: Build types to verify no errors**
```bash
pnpm --filter @reyogo/types run build
```
Expected: clean build.

- [ ] **Step 5: Commit**
```bash
git add lib/types/src/entities/index.ts lib/types/src/invoices/index.ts lib/types/src/index.ts
git commit -m "feat(types): add IBusinessGroup, IEntity, ICompleteSetupPayload; entityId on invoice payload"
```

---

## Task 5: Entities repository

**Files:**
- Create: `lib/db/src/repositories/entities/index.ts`
- Create: `lib/db/src/repositories/entities/index.test.ts`
- Modify: `lib/db/src/index.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// lib/db/src/repositories/entities/index.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb, type DbClient } from '../../__tests__/helpers';
import { createEntitiesRepo } from '.';

let db: DbClient;
let repo: ReturnType<typeof createEntitiesRepo>;

beforeEach(async () => {
  db = await createTestDb();
  repo = createEntitiesRepo(db);
});

describe('createEntitiesRepo', () => {
  describe('getGroup', () => {
    it('returns the default business group', async () => {
      const group = await repo.getGroup('default');
      expect(group).not.toBeNull();
      expect(group!.name).toBe('Test Group');
    });

    it('returns null when account has no group', async () => {
      const group = await repo.getGroup('nonexistent');
      expect(group).toBeNull();
    });
  });

  describe('getEntities', () => {
    it('returns all active entities for the account', async () => {
      const result = await repo.getEntities('default');
      expect(result).toHaveLength(1);
      expect(result[0]!.name).toBe('Test Entity');
      expect(result[0]!.archivedAt).toBeNull();
    });
  });

  describe('updateGroupName', () => {
    it('updates the group name', async () => {
      await repo.updateGroupName('default-group', 'New Name');
      const group = await repo.getGroup('default');
      expect(group!.name).toBe('New Name');
    });
  });

  describe('createEntity', () => {
    it('creates a new entity in the group', async () => {
      await repo.createEntity({ id: 'entity-2', groupId: 'default-group', name: 'Bar' });
      const result = await repo.getEntities('default');
      expect(result).toHaveLength(2);
      expect(result.map((e) => e.name)).toContain('Bar');
    });
  });

  describe('renameEntity', () => {
    it('renames an existing entity', async () => {
      await repo.renameEntity('default-entity', 'Renamed');
      const result = await repo.getEntities('default');
      expect(result[0]!.name).toBe('Renamed');
    });
  });

  describe('completeSetup', () => {
    it('sets setupComplete=true on the account', async () => {
      await repo.completeSetup('default', 'The Crown Group', ['The Crown Pub', 'Gin on Tap']);
      const group = await repo.getGroup('default');
      expect(group!.name).toBe('The Crown Group');
      const ents = await repo.getEntities('default');
      expect(ents.map((e) => e.name)).toContain('The Crown Pub');
      expect(ents.map((e) => e.name)).toContain('Gin on Tap');
    });
  });

  describe('getSetupState', () => {
    it('returns setupComplete=false initially', async () => {
      const state = await repo.getSetupState('default');
      expect(state.setupComplete).toBe(false);
    });
  });
});
```

- [ ] **Step 2: Run to confirm failure**
```bash
pnpm --filter @reyogo/db exec vitest run src/repositories/entities/index.test.ts
```
Expected: FAIL — cannot find module `'.'`

- [ ] **Step 3: Implement the repository**

```ts
// lib/db/src/repositories/entities/index.ts
import { eq } from 'drizzle-orm';
import type { IBusinessGroup, IEntity, VatMode } from '@reyogo/types';
import type { DbClient } from '../../client';
import * as schema from '../../schema';
import { now } from '../../utils/timestamps';
import { generateId } from '../../utils/ids';

function toIEntity(row: schema.EntityRow): IEntity {
  return {
    id: row.id,
    groupId: row.groupId,
    name: row.name,
    defaultVatRate: row.defaultVatRate,
    defaultVatMode: row.defaultVatMode as VatMode,
    archivedAt: row.archivedAt ?? null,
  };
}

export function createEntitiesRepo(db: DbClient) {
  return {
    async getGroup(accountId: string): Promise<IBusinessGroup | null> {
      const rows = await db
        .select()
        .from(schema.businessGroups)
        .where(eq(schema.businessGroups.accountId, accountId))
        .limit(1);
      if (!rows[0]) return null;
      return { id: rows[0].id, name: rows[0].name };
    },

    async getEntities(accountId: string): Promise<IEntity[]> {
      const groupRows = await db
        .select({ id: schema.businessGroups.id })
        .from(schema.businessGroups)
        .where(eq(schema.businessGroups.accountId, accountId))
        .limit(1);
      if (!groupRows[0]) return [];
      const rows = await db
        .select()
        .from(schema.entities)
        .where(eq(schema.entities.groupId, groupRows[0].id))
        .orderBy(schema.entities.createdAt);
      return rows.filter((r) => !r.archivedAt).map(toIEntity);
    },

    async updateGroupName(groupId: string, name: string): Promise<void> {
      await db
        .update(schema.businessGroups)
        .set({ name })
        .where(eq(schema.businessGroups.id, groupId));
    },

    async createEntity(input: { id: string; groupId: string; name: string }): Promise<void> {
      await db.insert(schema.entities).values({
        id: input.id,
        groupId: input.groupId,
        name: input.name,
        defaultVatRate: 15,
        defaultVatMode: 'exclusive',
        createdAt: now(),
      });
    },

    async renameEntity(entityId: string, name: string): Promise<void> {
      await db
        .update(schema.entities)
        .set({ name })
        .where(eq(schema.entities.id, entityId));
    },

    async updateEntityVat(
      entityId: string,
      vatRate: number,
      vatMode: VatMode,
    ): Promise<void> {
      await db
        .update(schema.entities)
        .set({ defaultVatRate: vatRate, defaultVatMode: vatMode })
        .where(eq(schema.entities.id, entityId));
    },

    async getSetupState(accountId: string): Promise<{ setupComplete: boolean }> {
      const rows = await db
        .select({ setupComplete: schema.accounts.setupComplete })
        .from(schema.accounts)
        .where(eq(schema.accounts.id, accountId))
        .limit(1);
      return { setupComplete: rows[0]?.setupComplete ?? false };
    },

    async completeSetup(
      accountId: string,
      groupName: string,
      entityNames: string[],
    ): Promise<void> {
      const groupRows = await db
        .select()
        .from(schema.businessGroups)
        .where(eq(schema.businessGroups.accountId, accountId))
        .limit(1);

      await db.transaction(async (tx) => {
        if (groupRows[0]) {
          await tx
            .update(schema.businessGroups)
            .set({ name: groupName })
            .where(eq(schema.businessGroups.id, groupRows[0].id));

          await tx
            .delete(schema.entities)
            .where(eq(schema.entities.groupId, groupRows[0].id));

          for (const name of entityNames) {
            await tx.insert(schema.entities).values({
              id: generateId(),
              groupId: groupRows[0].id,
              name,
              defaultVatRate: 15,
              defaultVatMode: 'exclusive',
              createdAt: now(),
            });
          }
        }

        await tx
          .update(schema.accounts)
          .set({ setupComplete: true })
          .where(eq(schema.accounts.id, accountId));
      });
    },
  };
}
```

- [ ] **Step 4: Run tests to confirm pass**
```bash
pnpm --filter @reyogo/db exec vitest run src/repositories/entities/index.test.ts
```
Expected: all tests pass.

- [ ] **Step 5: Export from lib/db index**

Add to `lib/db/src/index.ts`:
```ts
export { createEntitiesRepo } from './repositories/entities';
```

- [ ] **Step 6: Commit**
```bash
git add lib/db/src/repositories/entities/ lib/db/src/index.ts
git commit -m "feat(db): entities repository with group/entity CRUD and setup completion"
```

---

## Task 6: Update invoices repository to accept entityId

**Files:**
- Modify: `lib/db/src/repositories/invoices/index.ts`
- Modify: `lib/db/src/repositories/invoices/index.test.ts`

- [ ] **Step 1: Add entityId tests**

In `lib/db/src/repositories/invoices/index.test.ts`, update the helper seed to include `entityId` on invoice payloads. Find the existing `saveInvoice` tests and add:

```ts
it('stamps entityId on the saved invoice', async () => {
  await repo.saveInvoice({
    id: 'inv-1',
    entityId: 'default-entity',
    supplierId: null,
    invoiceNumber: null,
    invoiceDate: null,
    vatMode: 'exclusive',
    vatRate: 15,
    lines: [],
  });
  const inv = await repo.getInvoiceById('inv-1');
  expect(inv).not.toBeNull();
});
```

- [ ] **Step 2: Run to confirm existing tests still pass (they should — entityId is new required field, tests need updating)**
```bash
pnpm --filter @reyogo/db exec vitest run src/repositories/invoices/index.test.ts
```

- [ ] **Step 3: Update insertMovementsForLines to accept entityId**

In `lib/db/src/repositories/invoices/index.ts`, update the `insertMovementsForLines` signature:

```ts
async function insertMovementsForLines(
  tx: TxClient,
  lines: MovementLine[],
  referenceId: string,
  entityId: string,
  occurredAt: Date,
  createdAt: Date,
): Promise<void> {
  for (const line of lines.filter((l) => l.quantity > 0)) {
    const prev = await getLatestMovement(tx, line.itemId);
    const unitCost = line.quantity > 0 ? line.totalVatExclude / line.quantity : 0;
    const newWac = calculateWAC(
      prev?.stockQtyAfter ?? 0,
      prev?.weightedAvgCostAfter ?? null,
      line.quantity,
      unitCost,
    );
    const newQty = (prev?.stockQtyAfter ?? 0) + line.quantity;
    await tx.insert(schema.stockMovements).values({
      id: generateId(),
      inventoryItemId: line.itemId,
      accountId: 'default',
      entityId,
      movementType: MovementType.In,
      qty: line.quantity,
      unitCostAtTime: unitCost,
      totalCost: line.totalVatExclude,
      weightedAvgCostAfter: newWac,
      stockQtyAfter: newQty,
      referenceType: 'invoice',
      referenceId,
      occurredAt,
      createdAt,
    });
  }
}
```

- [ ] **Step 4: Update saveInvoice, saveAndPostInvoice, postInvoice**

In `saveInvoice`, add `entityId` to the insert and pass through from payload:
```ts
await tx.insert(schema.invoices).values({
  id: payload.id,
  entityId: payload.entityId,
  supplierId: payload.supplierId ?? null,
  accountId: 'default',
  // ... rest unchanged
});
```

In `saveAndPostInvoice`, same change plus pass `entityId` to `insertMovementsForLines`:
```ts
await insertMovementsForLines(tx, validLines, payload.id, payload.entityId, occurredAt, createdAt);
```

In `postInvoice`, read `entityId` from the fetched invoice and pass it:
```ts
await insertMovementsForLines(tx, invoice.lines, id, invoice.entityId, occurredAt, postedAt);
```

Add `entityId` to `IInvoice` return type mapping in `toIInvoice`:
```ts
function toIInvoice(row: schema.InvoiceRow): IInvoice {
  return {
    id: row.id,
    entityId: row.entityId,
    supplierId: row.supplierId ?? null,
    // ... rest unchanged
  };
}
```

Also add `entityId: string` to `IInvoice` in `lib/types/src/invoices/index.ts`.

- [ ] **Step 5: Run all DB tests**
```bash
pnpm --filter @reyogo/db run test
```
Expected: all pass.

- [ ] **Step 6: Commit**
```bash
git add lib/db/src/repositories/invoices/ lib/types/src/invoices/index.ts
git commit -m "feat(db): propagate entityId through invoice and movement writes"
```

---

## Task 7: IPC channels + handler + renderer service

**Files:**
- Create: `apps/desktop/src/shared/types/ipc/entities.ts`
- Modify: `apps/desktop/src/shared/types/ipc/index.ts`
- Modify: `apps/desktop/src/shared/types/ipc/invoke-map.ts`
- Create: `apps/desktop/src/main/handlers/entities/index.ts`
- Modify: `apps/desktop/src/main/ipc.ts`
- Modify: `apps/desktop/src/main/db/index.ts`
- Create: `apps/desktop/src/renderer/src/services/entities/index.ts`
- Create: `apps/desktop/src/renderer/src/services/entities/index.test.ts`

- [ ] **Step 1: Create IPC channel constants**

```ts
// apps/desktop/src/shared/types/ipc/entities.ts
export const EntitiesIPC = {
  GET_GROUP:         'entities:get-group',
  GET_ENTITIES:      'entities:get-entities',
  GET_SETUP_STATE:   'entities:get-setup-state',
  COMPLETE_SETUP:    'entities:complete-setup',
  UPDATE_GROUP_NAME: 'entities:update-group-name',
  CREATE_ENTITY:     'entities:create-entity',
  RENAME_ENTITY:     'entities:rename-entity',
  UPDATE_ENTITY_VAT: 'entities:update-entity-vat',
} as const;

export type EntitiesIPC = typeof EntitiesIPC[keyof typeof EntitiesIPC];
```

- [ ] **Step 2: Export from IPC index**

Add to `apps/desktop/src/shared/types/ipc/index.ts`:
```ts
export { EntitiesIPC } from './entities';
```

- [ ] **Step 3: Add channels to invoke-map**

Add imports and entries to `apps/desktop/src/shared/types/ipc/invoke-map.ts`:
```ts
import type { IBusinessGroup, IEntity, ICompleteSetupPayload } from '@reyogo/types';
```

Add to `IPCInvokeMap`:
```ts
'entities:get-group':         { args: []; return: IBusinessGroup | null };
'entities:get-entities':      { args: []; return: IEntity[] };
'entities:get-setup-state':   { args: []; return: { setupComplete: boolean } };
'entities:complete-setup':    { args: [payload: ICompleteSetupPayload]; return: void };
'entities:update-group-name': { args: [name: string]; return: void };
'entities:create-entity':     { args: [name: string]; return: IEntity[] };
'entities:rename-entity':     { args: [entityId: string, name: string]; return: void };
'entities:update-entity-vat': { args: [entityId: string, vatRate: number, vatMode: string]; return: void };
```

- [ ] **Step 4: Create IPC handler**

```ts
// apps/desktop/src/main/handlers/entities/index.ts
import { ipcMain } from 'electron';
import type { ICompleteSetupPayload, VatMode } from '@reyogo/types';
import { EntitiesIPC } from '@shared/types/ipc';
import { getRepos } from '../../db';

export function registerEntitiesHandlers(): void {
  ipcMain.handle(EntitiesIPC.GET_GROUP, () => getRepos().entities.getGroup('default'));
  ipcMain.handle(EntitiesIPC.GET_ENTITIES, () => getRepos().entities.getEntities('default'));
  ipcMain.handle(EntitiesIPC.GET_SETUP_STATE, () => getRepos().entities.getSetupState('default'));
  ipcMain.handle(EntitiesIPC.COMPLETE_SETUP, (_e, payload: ICompleteSetupPayload) =>
    getRepos().entities.completeSetup('default', payload.groupName, payload.entityNames),
  );
  ipcMain.handle(EntitiesIPC.UPDATE_GROUP_NAME, (_e, name: string) =>
    getRepos().entities.updateGroupName('default-group', name),
  );
  ipcMain.handle(EntitiesIPC.CREATE_ENTITY, async (_e, name: string) => {
    const id = crypto.randomUUID();
    await getRepos().entities.createEntity({ id, groupId: 'default-group', name });
    return getRepos().entities.getEntities('default');
  });
  ipcMain.handle(EntitiesIPC.RENAME_ENTITY, (_e, entityId: string, name: string) =>
    getRepos().entities.renameEntity(entityId, name),
  );
  ipcMain.handle(
    EntitiesIPC.UPDATE_ENTITY_VAT,
    (_e, entityId: string, vatRate: number, vatMode: string) =>
      getRepos().entities.updateEntityVat(entityId, vatRate, vatMode as VatMode),
  );
}
```

- [ ] **Step 5: Register in ipc.ts**

```ts
// apps/desktop/src/main/ipc.ts
import { registerEntitiesHandlers } from './handlers/entities';
// ... existing imports

export const registerIPC = () => {
  registerAppHandlers();
  registerEntitiesHandlers();
  registerInventoryHandlers();
  registerInvoicesHandlers();
  registerSetupHandlers();
  registerShellHandlers();
  registerStockMovementsHandlers();
  registerSuppliersHandlers();
};
```

- [ ] **Step 6: Add entities repo to db/index.ts**

In `apps/desktop/src/main/db/index.ts`, import and wire up `createEntitiesRepo`:

```ts
import {
  createDbClient,
  createInventoryRepo,
  createSuppliersRepo,
  createStockMovementsRepo,
  createInvoicesRepo,
  createSetupRepo,
  createEntitiesRepo,
  schema,
  type DbClient,
} from '@reyogo/db';
```

Update `Repos` type:
```ts
type Repos = {
  entities: ReturnType<typeof createEntitiesRepo>;
  inventory: ReturnType<typeof createInventoryRepo>;
  suppliers: ReturnType<typeof createSuppliersRepo>;
  stockMovements: ReturnType<typeof createStockMovementsRepo>;
  invoices: ReturnType<typeof createInvoicesRepo>;
  setup: ReturnType<typeof createSetupRepo>;
};
```

Update `_repos` initialisation in `initDatabase()`:
```ts
_repos = {
  entities: createEntitiesRepo(db),
  inventory: createInventoryRepo(db),
  suppliers: createSuppliersRepo(db),
  stockMovements: createStockMovementsRepo(db),
  invoices: createInvoicesRepo(db),
  setup: createSetupRepo(db),
};
```

- [ ] **Step 7: Write renderer service tests**

```ts
// apps/desktop/src/renderer/src/services/entities/index.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { entitiesService } from '.';

const mockInvoke = vi.fn();

beforeEach(() => {
  mockInvoke.mockReset();
  Object.defineProperty(window, 'electronAPI', {
    value: { ipcRenderer: { invoke: mockInvoke } },
    writable: true,
  });
});

describe('entitiesService', () => {
  it('getEntities calls the correct channel', async () => {
    mockInvoke.mockResolvedValue([]);
    await entitiesService.getEntities();
    expect(mockInvoke).toHaveBeenCalledWith('entities:get-entities');
  });

  it('completeSetup calls the correct channel with payload', async () => {
    mockInvoke.mockResolvedValue(undefined);
    await entitiesService.completeSetup({ groupName: 'G', entityNames: ['E1'] });
    expect(mockInvoke).toHaveBeenCalledWith('entities:complete-setup', {
      groupName: 'G',
      entityNames: ['E1'],
    });
  });
});
```

- [ ] **Step 8: Implement renderer service**

```ts
// apps/desktop/src/renderer/src/services/entities/index.ts
import { EntitiesIPC } from '@shared/types/ipc';
import type { IBusinessGroup, ICompleteSetupPayload, IEntity } from '@reyogo/types';

export const entitiesService = {
  getGroup: (): Promise<IBusinessGroup | null> =>
    window.electronAPI.ipcRenderer.invoke(EntitiesIPC.GET_GROUP),
  getEntities: (): Promise<IEntity[]> =>
    window.electronAPI.ipcRenderer.invoke(EntitiesIPC.GET_ENTITIES),
  getSetupState: (): Promise<{ setupComplete: boolean }> =>
    window.electronAPI.ipcRenderer.invoke(EntitiesIPC.GET_SETUP_STATE),
  completeSetup: (payload: ICompleteSetupPayload): Promise<void> =>
    window.electronAPI.ipcRenderer.invoke(EntitiesIPC.COMPLETE_SETUP, payload),
  updateGroupName: (name: string): Promise<void> =>
    window.electronAPI.ipcRenderer.invoke(EntitiesIPC.UPDATE_GROUP_NAME, name),
  createEntity: (name: string): Promise<IEntity[]> =>
    window.electronAPI.ipcRenderer.invoke(EntitiesIPC.CREATE_ENTITY, name),
  renameEntity: (entityId: string, name: string): Promise<void> =>
    window.electronAPI.ipcRenderer.invoke(EntitiesIPC.RENAME_ENTITY, entityId, name),
  updateEntityVat: (entityId: string, vatRate: number, vatMode: string): Promise<void> =>
    window.electronAPI.ipcRenderer.invoke(EntitiesIPC.UPDATE_ENTITY_VAT, entityId, vatRate, vatMode),
};
```

- [ ] **Step 9: Run service tests**
```bash
pnpm --filter @reyogo/desktop exec vitest run src/renderer/src/services/entities/index.test.ts
```
Expected: all pass.

- [ ] **Step 10: Run typecheck**
```bash
pnpm run typecheck
```
Expected: clean.

- [ ] **Step 11: Commit**
```bash
git add apps/desktop/src/shared/types/ipc/ apps/desktop/src/main/handlers/entities/ apps/desktop/src/main/ipc.ts apps/desktop/src/main/db/index.ts apps/desktop/src/renderer/src/services/entities/
git commit -m "feat: entities IPC channels, handler, and renderer service"
```

---

## Task 8: EntityContext

**Files:**
- Create: `apps/desktop/src/renderer/src/Context/EntityContext/index.tsx`
- Create: `apps/desktop/src/renderer/src/Context/EntityContext/index.test.tsx`
- Modify: `apps/desktop/src/renderer/src/components/App/index.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
// apps/desktop/src/renderer/src/Context/EntityContext/index.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { EntityProvider, useEntities } from '.';

const mockEntities = [
  { id: 'e1', groupId: 'g1', name: 'The Crown Pub', defaultVatRate: 15, defaultVatMode: 'exclusive', archivedAt: null },
];
const mockGroup = { id: 'g1', name: 'The Crown Group' };

vi.mock('@/services/entities', () => ({
  entitiesService: {
    getEntities: vi.fn().mockResolvedValue(mockEntities),
    getGroup: vi.fn().mockResolvedValue(mockGroup),
  },
}));

describe('EntityContext', () => {
  it('provides entities after mount', async () => {
    const { result } = renderHook(() => useEntities(), {
      wrapper: ({ children }) => <EntityProvider>{children}</EntityProvider>,
    });
    await act(async () => {});
    expect(result.current.entities).toHaveLength(1);
    expect(result.current.entities[0]!.name).toBe('The Crown Pub');
  });

  it('provides group after mount', async () => {
    const { result } = renderHook(() => useEntities(), {
      wrapper: ({ children }) => <EntityProvider>{children}</EntityProvider>,
    });
    await act(async () => {});
    expect(result.current.group?.name).toBe('The Crown Group');
  });

  it('throws when used outside provider', () => {
    expect(() => renderHook(() => useEntities())).toThrow();
  });
});
```

- [ ] **Step 2: Run to confirm failure**
```bash
pnpm --filter @reyogo/desktop exec vitest run src/renderer/src/Context/EntityContext/index.test.tsx
```
Expected: FAIL — module not found.

- [ ] **Step 3: Implement EntityContext**

```tsx
// apps/desktop/src/renderer/src/Context/EntityContext/index.tsx
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { IBusinessGroup, IEntity } from '@reyogo/types';
import { entitiesService } from '@/services/entities';

interface EntityContextValue {
  group: IBusinessGroup | null;
  entities: IEntity[];
  refetchEntities: () => Promise<void>;
}

const EntityContext = createContext<EntityContextValue | null>(null);

export function EntityProvider({ children }: { children: React.ReactNode }) {
  const [group, setGroup] = useState<IBusinessGroup | null>(null);
  const [entities, setEntities] = useState<IEntity[]>([]);

  const refetchEntities = useCallback(async () => {
    const [g, e] = await Promise.all([
      entitiesService.getGroup(),
      entitiesService.getEntities(),
    ]);
    setGroup(g);
    setEntities(e);
  }, []);

  useEffect(() => {
    refetchEntities().catch(console.error);
  }, [refetchEntities]);

  return (
    <EntityContext.Provider value={{ group, entities, refetchEntities }}>
      {children}
    </EntityContext.Provider>
  );
}

export function useEntities(): EntityContextValue {
  const ctx = useContext(EntityContext);
  if (!ctx) throw new Error('useEntities must be used within EntityProvider');
  return ctx;
}
```

- [ ] **Step 4: Run tests to confirm pass**
```bash
pnpm --filter @reyogo/desktop exec vitest run src/renderer/src/Context/EntityContext/index.test.tsx
```
Expected: all pass.

- [ ] **Step 5: Wrap app with EntityProvider**

In `apps/desktop/src/renderer/src/components/App/index.tsx`:
```tsx
import { AppConfigProvider } from '@/Context';
import { EntityProvider } from '@/Context/EntityContext';

const App = () => {
  return (
    <AppConfigProvider>
      <EntityProvider>
        <Router
          _providerProps={{ future: { v7_startTransition: true } }}
          main={<Route path="*" element={<AppLoader />} />}
        />
        <Toaster position="bottom-right" />
      </EntityProvider>
    </AppConfigProvider>
  );
};
```

- [ ] **Step 6: Commit**
```bash
git add apps/desktop/src/renderer/src/Context/EntityContext/ apps/desktop/src/renderer/src/components/App/index.tsx
git commit -m "feat: EntityContext providing entities and group app-wide"
```

---

## Task 9: Setup wizard gate in AppLoader

**Files:**
- Modify: `apps/desktop/src/renderer/src/components/AppLoader/hooks/useAppReady/index.ts`
- Modify: `apps/desktop/src/renderer/src/components/AppLoader/index.tsx`

- [ ] **Step 1: Update useAppReady to fetch setupComplete**

```ts
// apps/desktop/src/renderer/src/components/AppLoader/hooks/useAppReady/index.ts
import { useCallback, useEffect, useState } from 'react';
import { appService } from '@/services/app';
import { entitiesService } from '@/services/entities';

export function useAppReady() {
  const [isReady, setIsReady] = useState(false);
  const [setupComplete, setSetupComplete] = useState<boolean | null>(null);
  const [initError, setInitError] = useState<string | null>(null);

  const checkSetup = useCallback(async () => {
    const state = await entitiesService.getSetupState();
    setSetupComplete(state.setupComplete);
    setIsReady(true);
  }, []);

  useEffect(() => {
    appService.onAppReady(() => checkSetup().catch(console.error));
    appService.onAppInitError((message) => setInitError(message));
    appService.requestAppReady();
  }, [checkSetup]);

  return { isReady, setupComplete, initError };
}
```

- [ ] **Step 2: Update AppLoader to show wizard when !setupComplete**

```tsx
// apps/desktop/src/renderer/src/components/AppLoader/index.tsx
import AppRoutes from '@/components/AppRoutes';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSpinner } from './LoadingSpinner';
import { useAppReady } from './hooks/useAppReady';
import SetupWizard from '@/pages/SetupWizard';

const AppLoader = () => {
  const { isReady, setupComplete, initError } = useAppReady();

  if (initError) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4 bg-background p-8">
        <img
          src={`${import.meta.env.BASE_URL}logo.svg`}
          alt="ReYoGo"
          className="size-16 opacity-50"
          draggable={false}
        />
        <div className="flex flex-col items-center gap-2 text-center max-w-lg">
          <span className="text-base font-semibold text-foreground">Failed to start ReYoGo</span>
          <span className="text-sm text-muted-foreground">
            The database could not be initialized. If this app is installed inside a OneDrive or
            cloud-synced folder, try moving it to a local folder (e.g. Desktop or C:\Program Files).
          </span>
          <code className="mt-2 rounded bg-muted px-3 py-2 text-xs text-muted-foreground break-all">
            {initError}
          </code>
        </div>
      </div>
    );
  }

  if (!isReady || setupComplete === null) return <LoadingSpinner />;
  if (!setupComplete) return <SetupWizard />;

  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  );
};

export default AppLoader;
```

- [ ] **Step 3: Commit (SetupWizard page created next task)**
```bash
git add apps/desktop/src/renderer/src/components/AppLoader/
git commit -m "feat: AppLoader checks setupComplete and gates wizard"
```

---

## Task 10: Setup wizard

**Files:**
- Create: `apps/desktop/src/renderer/src/pages/SetupWizard/index.tsx`
- Create: `apps/desktop/src/renderer/src/pages/SetupWizard/components/GroupStep/index.tsx`
- Create: `apps/desktop/src/renderer/src/pages/SetupWizard/components/EntitiesStep/index.tsx`
- Create: `apps/desktop/src/renderer/src/pages/SetupWizard/hooks/useSetupWizard/index.ts`
- Create: `apps/desktop/src/renderer/src/pages/SetupWizard/hooks/useSetupWizard/index.test.ts`

- [ ] **Step 1: Write failing hook tests**

```ts
// apps/desktop/src/renderer/src/pages/SetupWizard/hooks/useSetupWizard/index.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSetupWizard } from '.';

const mockCompleteSetup = vi.fn();

vi.mock('@/services/entities', () => ({
  entitiesService: {
    completeSetup: mockCompleteSetup,
  },
}));

describe('useSetupWizard', () => {
  beforeEach(() => mockCompleteSetup.mockReset());

  it('starts on step 1', () => {
    const { result } = renderHook(() => useSetupWizard());
    expect(result.current.step).toBe(1);
  });

  it('advances to step 2 when group name is set', () => {
    const { result } = renderHook(() => useSetupWizard());
    act(() => result.current.setGroupName('The Crown Group'));
    act(() => result.current.next());
    expect(result.current.step).toBe(2);
  });

  it('does not advance from step 1 when group name is empty', () => {
    const { result } = renderHook(() => useSetupWizard());
    act(() => result.current.next());
    expect(result.current.step).toBe(1);
  });

  it('cannot remove last entity', () => {
    const { result } = renderHook(() => useSetupWizard());
    expect(result.current.entityNames).toHaveLength(1);
    act(() => result.current.removeEntity(0));
    expect(result.current.entityNames).toHaveLength(1);
  });

  it('calls completeSetup on submit with valid data', async () => {
    mockCompleteSetup.mockResolvedValue(undefined);
    const { result } = renderHook(() => useSetupWizard());
    act(() => result.current.setGroupName('G'));
    act(() => result.current.setEntityName(0, 'E1'));
    await act(() => result.current.submit());
    expect(mockCompleteSetup).toHaveBeenCalledWith({ groupName: 'G', entityNames: ['E1'] });
  });
});
```

- [ ] **Step 2: Run to confirm failure**
```bash
pnpm --filter @reyogo/desktop exec vitest run src/renderer/src/pages/SetupWizard/hooks/useSetupWizard/index.test.ts
```
Expected: FAIL.

- [ ] **Step 3: Implement useSetupWizard**

```ts
// apps/desktop/src/renderer/src/pages/SetupWizard/hooks/useSetupWizard/index.ts
import { useCallback, useState } from 'react';
import { entitiesService } from '@/services/entities';

export function useSetupWizard() {
  const [step, setStep] = useState(1);
  const [groupName, setGroupName] = useState('');
  const [entityNames, setEntityNames] = useState(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const next = useCallback(() => {
    if (step === 1 && groupName.trim()) setStep(2);
  }, [step, groupName]);

  const back = useCallback(() => {
    if (step > 1) setStep((s) => s - 1);
  }, [step]);

  const addEntity = useCallback(() => {
    setEntityNames((prev) => [...prev, '']);
  }, []);

  const removeEntity = useCallback((index: number) => {
    setEntityNames((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const setEntityName = useCallback((index: number, name: string) => {
    setEntityNames((prev) => prev.map((n, i) => (i === index ? name : n)));
  }, []);

  const canSubmit = entityNames.some((n) => n.trim().length > 0);

  const submit = useCallback(async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      await entitiesService.completeSetup({
        groupName: groupName.trim(),
        entityNames: entityNames.filter((n) => n.trim()).map((n) => n.trim()),
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [canSubmit, groupName, entityNames]);

  return {
    step,
    groupName,
    setGroupName,
    entityNames,
    addEntity,
    removeEntity,
    setEntityName,
    canSubmit,
    isSubmitting,
    next,
    back,
    submit,
  };
}
```

- [ ] **Step 4: Run tests to confirm pass**
```bash
pnpm --filter @reyogo/desktop exec vitest run src/renderer/src/pages/SetupWizard/hooks/useSetupWizard/index.test.ts
```
Expected: all pass.

- [ ] **Step 5: Implement GroupStep**

```tsx
// apps/desktop/src/renderer/src/pages/SetupWizard/components/GroupStep/index.tsx
import { Input } from '@reyogo/ui';
import { Button } from '@reyogo/ui';

interface GroupStepProps {
  groupName: string;
  onGroupNameChange: (v: string) => void;
  onNext: () => void;
}

export function GroupStep({ groupName, onGroupNameChange, onNext }: GroupStepProps) {
  return (
    <div className="flex flex-col gap-6 max-w-sm mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-white mb-1">Welcome to ReYoGo</h1>
        <p className="text-sm text-muted-foreground">
          Start with the name of your business group — the umbrella for all your venues.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Business group name
        </label>
        <Input
          value={groupName}
          onChange={(e) => onGroupNameChange(e.target.value)}
          placeholder="e.g. The Crown Group"
          onKeyDown={(e) => e.key === 'Enter' && onNext()}
          autoFocus
        />
      </div>
      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!groupName.trim()}>
          Next →
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Implement EntitiesStep**

```tsx
// apps/desktop/src/renderer/src/pages/SetupWizard/components/EntitiesStep/index.tsx
import { Button, Input } from '@reyogo/ui';

interface EntitiesStepProps {
  entityNames: string[];
  onAdd: () => void;
  onRemove: (i: number) => void;
  onNameChange: (i: number, v: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
  isSubmitting: boolean;
}

export function EntitiesStep({
  entityNames,
  onAdd,
  onRemove,
  onNameChange,
  onBack,
  onSubmit,
  canSubmit,
  isSubmitting,
}: EntitiesStepProps) {
  return (
    <div className="flex flex-col gap-6 max-w-sm mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-white mb-1">Add your venues</h1>
        <p className="text-sm text-muted-foreground">
          Each venue is a separate legal trading entity. You need at least one.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {entityNames.map((name, i) => (
          <div key={i} className="flex gap-2 items-center">
            <Input
              value={name}
              onChange={(e) => onNameChange(i, e.target.value)}
              placeholder={`Venue ${i + 1}`}
              autoFocus={i === entityNames.length - 1}
            />
            {entityNames.length > 1 && (
              <button
                onClick={() => onRemove(i)}
                className="text-muted-foreground hover:text-white transition-colors px-2"
                aria-label="Remove"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          onClick={onAdd}
          className="text-sm text-muted-foreground hover:text-white border border-dashed border-border rounded-lg px-4 py-2 transition-colors text-left"
        >
          + Add another venue
        </button>
      </div>
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          ← Back
        </Button>
        <Button onClick={onSubmit} disabled={!canSubmit || isSubmitting}>
          {isSubmitting ? 'Setting up…' : 'Get started'}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Implement SetupWizard root**

```tsx
// apps/desktop/src/renderer/src/pages/SetupWizard/index.tsx
import { useSetupWizard } from './hooks/useSetupWizard';
import { GroupStep } from './components/GroupStep';
import { EntitiesStep } from './components/EntitiesStep';

export default function SetupWizard() {
  const wizard = useSetupWizard();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-xs text-muted-foreground text-center mb-8">
          Step {wizard.step} of 2
        </div>
        {wizard.step === 1 && (
          <GroupStep
            groupName={wizard.groupName}
            onGroupNameChange={wizard.setGroupName}
            onNext={wizard.next}
          />
        )}
        {wizard.step === 2 && (
          <EntitiesStep
            entityNames={wizard.entityNames}
            onAdd={wizard.addEntity}
            onRemove={wizard.removeEntity}
            onNameChange={wizard.setEntityName}
            onBack={wizard.back}
            onSubmit={wizard.submit}
            canSubmit={wizard.canSubmit}
            isSubmitting={wizard.isSubmitting}
          />
        )}
      </div>
    </div>
  );
}
```

Note: after `submit()` succeeds, the AppLoader needs to reload `setupComplete`. The simplest approach: on successful submit, call `window.location.reload()` — the app restarts, `useAppReady` re-fetches `setupComplete` (now `true`), and `AppRoutes` loads normally.

Update `useSetupWizard` submit to reload on success:
```ts
const submit = useCallback(async () => {
  if (!canSubmit) return;
  setIsSubmitting(true);
  try {
    await entitiesService.completeSetup({
      groupName: groupName.trim(),
      entityNames: entityNames.filter((n) => n.trim()).map((n) => n.trim()),
    });
    window.location.reload();
  } finally {
    setIsSubmitting(false);
  }
}, [canSubmit, groupName, entityNames]);
```

- [ ] **Step 8: Commit**
```bash
git add apps/desktop/src/renderer/src/pages/SetupWizard/
git commit -m "feat: one-off setup wizard for group and entity naming"
```

---

## Task 11: Settings page + sidebar nav

**Files:**
- Create: `apps/desktop/src/renderer/src/pages/Settings/index.tsx`
- Create: `apps/desktop/src/renderer/src/pages/Settings/components/BusinessSection/index.tsx`
- Create: `apps/desktop/src/renderer/src/pages/Settings/components/BusinessSection/index.test.tsx`
- Create: `apps/desktop/src/renderer/src/pages/Settings/components/EntitiesSection/index.tsx`
- Create: `apps/desktop/src/renderer/src/pages/Settings/components/EntitiesSection/index.test.tsx`
- Create: `apps/desktop/src/renderer/src/pages/Settings/components/TaxSection/index.tsx`
- Create: `apps/desktop/src/renderer/src/pages/Settings/components/TaxSection/index.test.tsx`
- Modify: `apps/desktop/src/renderer/src/config/app.config.ts`
- Modify: `apps/desktop/src/renderer/src/components/AppRoutes/routes.tsx`
- Modify: `apps/desktop/src/renderer/src/components/AppRoutes/routePaths/index.ts`
- Modify: `apps/desktop/src/renderer/src/components/AppSidebar/index.tsx`

- [ ] **Step 1: Add settings route to app.config**

In `apps/desktop/src/renderer/src/config/app.config.ts`, add to `RouteConfig`:
```ts
settings: string;
```

Add to `routes`:
```ts
settings: '/settings',
```

Add to `nav.primary` array (after `suppliers`):
```ts
{ label: 'Settings', pathKey: 'settings', icon: 'Settings', end: true },
```

- [ ] **Step 2: Add SettingsRoutes to routePaths**

In `apps/desktop/src/renderer/src/components/AppRoutes/routePaths/index.ts`:
```ts
export const SettingsRoutes = {
  Base: r.settings,
} as const;

export const SettingsRouteSegments = {
  root: lastSeg(r.settings),
} as const;
```

- [ ] **Step 3: Add Settings route in routes.tsx**

```tsx
import SettingsPage from '@/pages/Settings';
import { SettingsRouteSegments } from './routePaths';
```

Inside the `<Route path={UserRoutes.Home} element={<AppLayout />}>` block:
```tsx
<Route path={SettingsRouteSegments.root} element={<SettingsPage />} />
```

- [ ] **Step 4: Update AppSidebar to pin Settings above collapse toggle**

In `apps/desktop/src/renderer/src/components/AppSidebar/index.tsx`, the bottom `<div>` currently only has the collapse button. Update to add Settings:

```tsx
import { NavLink } from 'react-router-dom';
import { SettingsRoutes } from '@/components/AppRoutes/routePaths';
import { Settings as SettingsIcon } from 'lucide-react';
```

Replace the bottom `<div className="shrink-0 p-2">` with:
```tsx
<div className="shrink-0 border-t border-[rgba(255,255,255,0.07)]">
  <div className="px-2 pt-2">
    <NavLink
      to={SettingsRoutes.Base}
      end
      title={collapsed ? 'Settings' : undefined}
      className={({ isActive }) =>
        cn(navLinkClass({ isActive }), collapsed && 'justify-center px-0')
      }
    >
      <SettingsIcon className="size-4 shrink-0" aria-hidden />
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span key="settings-label" {...labelAnim} className="whitespace-nowrap">
            Settings
          </motion.span>
        )}
      </AnimatePresence>
    </NavLink>
  </div>
  <div className="p-2">
    <button
      onClick={toggle}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-[rgba(255,255,255,0.05)] px-3 py-2 text-xs font-medium text-[rgba(255,255,255,0.4)] transition-colors hover:bg-[rgba(255,255,255,0.09)] hover:text-[rgba(255,255,255,0.75)]"
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      <motion.span animate={{ rotate: collapsed ? 0 : 180 }} transition={spring} className="flex">
        <ChevronRightIcon className="size-3.5" />
      </motion.span>
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span key="label" {...labelAnim} className="whitespace-nowrap">
            Collapse
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  </div>
</div>
```

Remove the `Settings` entry from `nav.primary` in `app.config.ts` (it's hardcoded in the sidebar now, not driven by config). Revert that change from Step 1.

- [ ] **Step 5: Write BusinessSection tests**

```tsx
// apps/desktop/src/renderer/src/pages/Settings/components/BusinessSection/index.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BusinessSection } from '.';

vi.mock('@/services/entities', () => ({
  entitiesService: { updateGroupName: vi.fn().mockResolvedValue(undefined) },
}));

const mockGroup = { id: 'g1', name: 'The Crown Group' };
const mockRefetch = vi.fn();

describe('BusinessSection', () => {
  it('shows current group name', () => {
    render(<BusinessSection group={mockGroup} onSaved={mockRefetch} />);
    expect(screen.getByDisplayValue('The Crown Group')).toBeInTheDocument();
  });

  it('calls updateGroupName and onSaved on save', async () => {
    const { entitiesService } = await import('@/services/entities');
    render(<BusinessSection group={mockGroup} onSaved={mockRefetch} />);
    fireEvent.change(screen.getByDisplayValue('The Crown Group'), {
      target: { value: 'New Name' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => expect(entitiesService.updateGroupName).toHaveBeenCalledWith('New Name'));
    expect(mockRefetch).toHaveBeenCalled();
  });
});
```

- [ ] **Step 6: Implement BusinessSection**

```tsx
// apps/desktop/src/renderer/src/pages/Settings/components/BusinessSection/index.tsx
import { useState } from 'react';
import { Button, Input } from '@reyogo/ui';
import type { IBusinessGroup } from '@reyogo/types';
import { entitiesService } from '@/services/entities';

interface BusinessSectionProps {
  group: IBusinessGroup | null;
  onSaved: () => Promise<void>;
}

export function BusinessSection({ group, onSaved }: BusinessSectionProps) {
  const [name, setName] = useState(group?.name ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !group) return;
    setSaving(true);
    try {
      await entitiesService.updateGroupName(name.trim());
      await onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Business
      </h2>
      <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-foreground">Business group name</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            The top-level owner of all your entities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-48 text-right"
          />
          <Button size="sm" onClick={handleSave} disabled={saving || !name.trim()}>
            Save
          </Button>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Write EntitiesSection tests**

```tsx
// apps/desktop/src/renderer/src/pages/Settings/components/EntitiesSection/index.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EntitiesSection } from '.';

vi.mock('@/services/entities', () => ({
  entitiesService: {
    createEntity: vi.fn().mockResolvedValue([]),
    renameEntity: vi.fn().mockResolvedValue(undefined),
  },
}));

const mockEntities = [
  { id: 'e1', groupId: 'g1', name: 'The Crown Pub', defaultVatRate: 15, defaultVatMode: 'exclusive', archivedAt: null },
];

describe('EntitiesSection', () => {
  it('renders entity list', () => {
    render(<EntitiesSection entities={mockEntities} onSaved={vi.fn()} />);
    expect(screen.getByText('The Crown Pub')).toBeInTheDocument();
  });

  it('calls createEntity when add button is used', async () => {
    const { entitiesService } = await import('@/services/entities');
    const onSaved = vi.fn();
    render(<EntitiesSection entities={mockEntities} onSaved={onSaved} />);
    fireEvent.click(screen.getByRole('button', { name: /add entity/i }));
    const input = screen.getByPlaceholderText(/new entity name/i);
    fireEvent.change(input, { target: { value: 'Gin on Tap' } });
    fireEvent.click(screen.getByRole('button', { name: /^add$/i }));
    await waitFor(() => expect(entitiesService.createEntity).toHaveBeenCalledWith('Gin on Tap'));
  });
});
```

- [ ] **Step 8: Implement EntitiesSection**

```tsx
// apps/desktop/src/renderer/src/pages/Settings/components/EntitiesSection/index.tsx
import { useState } from 'react';
import { Button, Input } from '@reyogo/ui';
import type { IEntity } from '@reyogo/types';
import { entitiesService } from '@/services/entities';

interface EntitiesSectionProps {
  entities: IEntity[];
  onSaved: () => Promise<void>;
}

function EntityRow({ entity, onSaved }: { entity: IEntity; onSaved: () => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(entity.name);
  const [saving, setSaving] = useState(false);
  const initial = entity.name[0]?.toUpperCase() ?? '?';

  const handleRename = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await entitiesService.renameEntity(entity.id, name.trim());
      await onSaved();
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        <div className="size-7 rounded-md bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
          {initial}
        </div>
        {editing ? (
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-7 text-sm"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
          />
        ) : (
          <span className="text-sm font-medium text-foreground">{entity.name}</span>
        )}
      </div>
      {editing ? (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
          <Button size="sm" onClick={handleRename} disabled={saving}>Save</Button>
        </div>
      ) : (
        <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>Rename</Button>
      )}
    </div>
  );
}

export function EntitiesSection({ entities, onSaved }: EntitiesSectionProps) {
  const [addingName, setAddingName] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!addingName.trim()) return;
    setAdding(true);
    try {
      await entitiesService.createEntity(addingName.trim());
      await onSaved();
      setAddingName('');
      setShowAdd(false);
    } finally {
      setAdding(false);
    }
  };

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Entities
      </h2>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {entities.map((e) => (
          <EntityRow key={e.id} entity={e} onSaved={onSaved} />
        ))}
        <div className="px-4 py-3">
          {showAdd ? (
            <div className="flex gap-2">
              <Input
                value={addingName}
                onChange={(ev) => setAddingName(ev.target.value)}
                placeholder="New entity name"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
              <Button size="sm" onClick={handleAdd} disabled={adding}>Add</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          ) : (
            <button
              onClick={() => setShowAdd(true)}
              className="w-full text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg py-2 hover:text-foreground transition-colors"
              aria-label="Add entity"
            >
              + Add entity
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 9: Implement TaxSection**

```tsx
// apps/desktop/src/renderer/src/pages/Settings/components/TaxSection/index.tsx
import { useState } from 'react';
import { Button, Input } from '@reyogo/ui';
import type { IEntity, VatMode } from '@reyogo/types';
import { entitiesService } from '@/services/entities';

interface TaxSectionProps {
  entities: IEntity[];
  onSaved: () => Promise<void>;
}

function EntityTaxRow({ entity, onSaved }: { entity: IEntity; onSaved: () => Promise<void> }) {
  const [vatRate, setVatRate] = useState(String(entity.defaultVatRate));
  const [vatMode, setVatMode] = useState<VatMode>(entity.defaultVatMode);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const rate = parseFloat(vatRate);
    if (isNaN(rate)) return;
    setSaving(true);
    try {
      await entitiesService.updateEntityVat(entity.id, rate, vatMode);
      await onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border last:border-0">
      <span className="text-sm font-medium text-foreground w-32 flex-shrink-0">{entity.name}</span>
      <div className="flex items-center gap-3 flex-1">
        <select
          value={vatMode}
          onChange={(e) => setVatMode(e.target.value as VatMode)}
          className="text-sm bg-input border border-border rounded-md px-2 py-1.5 text-foreground"
        >
          <option value="exclusive">Exclusive</option>
          <option value="inclusive">Inclusive</option>
        </select>
        <div className="flex items-center gap-1">
          <Input
            value={vatRate}
            onChange={(e) => setVatRate(e.target.value)}
            className="w-16 text-right"
          />
          <span className="text-sm text-muted-foreground">%</span>
        </div>
      </div>
      <Button size="sm" onClick={handleSave} disabled={saving}>Save</Button>
    </div>
  );
}

export function TaxSection({ entities, onSaved }: TaxSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Tax</h2>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {entities.map((e) => (
          <EntityTaxRow key={e.id} entity={e} onSaved={onSaved} />
        ))}
      </div>
    </section>
  );
}
```

Write a minimal TaxSection test:
```tsx
// apps/desktop/src/renderer/src/pages/Settings/components/TaxSection/index.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaxSection } from '.';

vi.mock('@/services/entities', () => ({
  entitiesService: { updateEntityVat: vi.fn() },
}));

describe('TaxSection', () => {
  it('renders one row per entity', () => {
    const entities = [
      { id: 'e1', groupId: 'g1', name: 'Pub', defaultVatRate: 15, defaultVatMode: 'exclusive' as const, archivedAt: null },
      { id: 'e2', groupId: 'g1', name: 'Bar', defaultVatRate: 15, defaultVatMode: 'exclusive' as const, archivedAt: null },
    ];
    render(<TaxSection entities={entities} onSaved={vi.fn()} />);
    expect(screen.getByText('Pub')).toBeInTheDocument();
    expect(screen.getByText('Bar')).toBeInTheDocument();
  });
});
```

- [ ] **Step 10: Implement Settings page root**

```tsx
// apps/desktop/src/renderer/src/pages/Settings/index.tsx
import { useEntities } from '@/Context/EntityContext';
import { BusinessSection } from './components/BusinessSection';
import { EntitiesSection } from './components/EntitiesSection';
import { TaxSection } from './components/TaxSection';

export default function SettingsPage() {
  const { group, entities, refetchEntities } = useEntities();

  return (
    <div className="flex flex-col gap-8 p-8 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure your business and app preferences</p>
      </div>
      <BusinessSection group={group} onSaved={refetchEntities} />
      <EntitiesSection entities={entities} onSaved={refetchEntities} />
      <TaxSection entities={entities} onSaved={refetchEntities} />
    </div>
  );
}
```

- [ ] **Step 11: Run all settings tests**
```bash
pnpm --filter @reyogo/desktop exec vitest run src/renderer/src/pages/Settings/
```
Expected: all pass.

- [ ] **Step 12: Commit**
```bash
git add apps/desktop/src/renderer/src/pages/Settings/ apps/desktop/src/renderer/src/components/AppSidebar/ apps/desktop/src/renderer/src/components/AppRoutes/ apps/desktop/src/renderer/src/config/app.config.ts
git commit -m "feat: Settings page with Business, Entities, and Tax sections; sidebar nav"
```

---

## Task 12: "Belongs to" on Add/Edit Item forms

**Files:**
- Modify: `apps/desktop/src/renderer/src/pages/Inventory/Capture/CapturedInventory/components/AddItemModal/index.tsx`
- Modify: `apps/desktop/src/renderer/src/pages/Inventory/Capture/CapturedInventory/components/EditItemDialog/index.tsx`

The `AddItemModal` and `EditItemDialog` need an entity dropdown. Both use a form that calls `addItem` / `updateItem` from `InventoryContext`. The `IInventoryItem` and `InventoryItemInput` types need `entityId` added.

- [ ] **Step 1: Add entityId to IInventoryItem in lib/types**

In `lib/types/src/inventory/index.ts`, add `entityId: string` to `IInventoryItem` and `InventoryItemInput`:
```ts
export interface IInventoryItem {
  id: string;
  entityId: string;
  name: string;
  categoryId: string;
  // ... rest unchanged
}
```

- [ ] **Step 2: Add entityId to inventoryItems repository upsert**

In `lib/db/src/repositories/inventory/index.ts`, find `upsertItem` and add `entityId` to the insert/update values. The item row now requires `entityId`.

- [ ] **Step 3: Add entity selector to AddItemModal**

Read the existing `AddItemModal/index.tsx`, then add:
```tsx
import { useEntities } from '@/Context/EntityContext';

// inside the component:
const { entities } = useEntities();
const [entityId, setEntityId] = useState(entities[0]?.id ?? '');

// in the form JSX, add a select:
<div className="flex flex-col gap-1.5">
  <label className="text-xs font-medium text-muted-foreground">Belongs to</label>
  <select
    value={entityId}
    onChange={(e) => setEntityId(e.target.value)}
    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
    required
  >
    <option value="">Select entity…</option>
    {entities.map((e) => (
      <option key={e.id} value={e.id}>{e.name}</option>
    ))}
  </select>
</div>

// pass entityId when calling addItem:
addItem({ name, categoryId, entityId, unitOfMeasureId, sku, reorderPoint, reorderQty })
```

Disable the save button when `!entityId`.

- [ ] **Step 4: Add entity selector to EditItemDialog**

Same pattern as AddItemModal. Pre-populate `entityId` from `item.entityId`. Call `updateItem` with the updated `entityId`.

- [ ] **Step 5: Run typecheck**
```bash
pnpm run typecheck
```
Expected: clean.

- [ ] **Step 6: Commit**
```bash
git add lib/types/src/inventory/index.ts lib/db/src/repositories/inventory/ apps/desktop/src/renderer/src/pages/Inventory/Capture/CapturedInventory/components/
git commit -m "feat: entity assignment on Add/Edit Item forms"
```

---

## Task 13: Entity selector on invoice capture + VAT rate from entity

**Files:**
- Modify: `apps/desktop/src/renderer/src/pages/Inventory/Invoice/hooks/useInvoiceForm/index.ts`
- Modify: `apps/desktop/src/renderer/src/pages/Inventory/Invoice/components/InvoiceHeader/index.tsx`
- Modify: `apps/desktop/src/renderer/src/pages/Inventory/Invoice/components/ItemAutocomplete/index.tsx`

- [ ] **Step 1: Add entityId to useInvoiceForm**

In `useInvoiceForm`, add:
```ts
import { useEntities } from '@/Context/EntityContext';

// inside hook:
const { entities } = useEntities();

const [entityId, setEntityId] = useState<string>(() => {
  return localStorage.getItem('last-invoice-entity') ?? entities[0]?.id ?? '';
});

const handleEntityChange = useCallback((newEntityId: string) => {
  const dirty = lines.some((l) => l.itemId);
  if (dirty) {
    if (!window.confirm('Changing entity will clear your current lines. Continue?')) return;
    setLines([createEmptyLine()]);
  }
  setEntityId(newEntityId);
  localStorage.setItem('last-invoice-entity', newEntityId);
}, [lines, setLines]);
```

Pass `entityId` into `handleSave` and `handleSaveDraft` payloads:
```ts
await invoiceService.saveAndPostInvoice({
  id: window.crypto.randomUUID(),
  entityId,
  supplierId: supplierId || null,
  // ...
  vatRate: entities.find((e) => e.id === entityId)?.defaultVatRate ?? 15,
  // vatMode stays user-input
  // ...
});
```

Return `entityId`, `handleEntityChange`, and `entities` from the hook.

- [ ] **Step 2: Write tests for entityId in useInvoiceForm**

In `useInvoiceForm`'s test file (create if missing at same path), add:
```ts
it('resets lines when entity changes and form is dirty', () => {
  // mock useEntities, set a line with itemId, call handleEntityChange with confirm mocked
});
```

- [ ] **Step 3: Add entity selector to InvoiceHeader**

Read `apps/desktop/src/renderer/src/pages/Inventory/Invoice/components/InvoiceHeader/index.tsx` then add an entity select alongside the other header fields, bound to `entityId` / `handleEntityChange`.

- [ ] **Step 4: Filter ItemAutocomplete by entityId**

In `apps/desktop/src/renderer/src/pages/Inventory/Invoice/components/ItemAutocomplete/index.tsx`, accept an `entityId` prop and filter the items list:
```ts
const filtered = items.filter((item) => item.entityId === entityId);
```

Pass `entityId` from the parent invoice form down to `ItemAutocomplete` wherever it is used.

- [ ] **Step 5: Remove vatRate input from invoice capture form**

Find where `vatRate` is rendered as an input in the invoice capture UI and remove it. The rate is now derived from `entities.find((e) => e.id === entityId)?.defaultVatRate`.

- [ ] **Step 6: Run tests**
```bash
pnpm --filter @reyogo/desktop exec vitest run src/renderer/src/pages/Inventory/Invoice/
```
Expected: all pass.

- [ ] **Step 7: Commit**
```bash
git add apps/desktop/src/renderer/src/pages/Inventory/Invoice/
git commit -m "feat: entity selector on invoice capture; item autocomplete filters by entity; vatRate from entity"
```

---

## Task 14: EntityFilter component + filtering on inventory/invoice/reports surfaces

**Files:**
- Create: `apps/desktop/src/renderer/src/components/EntityFilter/index.tsx`
- Create: `apps/desktop/src/renderer/src/components/EntityFilter/index.test.tsx`
- Modify: `apps/desktop/src/renderer/src/pages/Inventory/Capture/CapturedInventory/index.tsx`
- Modify: `apps/desktop/src/renderer/src/pages/Inventory/Invoice/History/index.tsx`
- Modify: `apps/desktop/src/renderer/src/pages/Inventory/Costing/Dashboard/index.tsx`
- Modify: `apps/desktop/src/renderer/src/pages/Inventory/Costing/CostReport/index.tsx`

- [ ] **Step 1: Write EntityFilter tests**

```tsx
// apps/desktop/src/renderer/src/components/EntityFilter/index.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EntityFilter } from '.';

const entities = [
  { id: 'e1', groupId: 'g1', name: 'Pub', defaultVatRate: 15, defaultVatMode: 'exclusive' as const, archivedAt: null },
  { id: 'e2', groupId: 'g1', name: 'Bar', defaultVatRate: 15, defaultVatMode: 'exclusive' as const, archivedAt: null },
];

describe('EntityFilter', () => {
  it('renders All + one pill per entity', () => {
    render(<EntityFilter entities={entities} selected={null} onChange={vi.fn()} />);
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Pub')).toBeInTheDocument();
    expect(screen.getByText('Bar')).toBeInTheDocument();
  });

  it('calls onChange with entity id when pill clicked', () => {
    const onChange = vi.fn();
    render(<EntityFilter entities={entities} selected={null} onChange={onChange} />);
    fireEvent.click(screen.getByText('Pub'));
    expect(onChange).toHaveBeenCalledWith('e1');
  });

  it('calls onChange with null when All clicked', () => {
    const onChange = vi.fn();
    render(<EntityFilter entities={entities} selected="e1" onChange={onChange} />);
    fireEvent.click(screen.getByText('All'));
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
```

- [ ] **Step 2: Run to confirm failure**
```bash
pnpm --filter @reyogo/desktop exec vitest run src/renderer/src/components/EntityFilter/index.test.tsx
```

- [ ] **Step 3: Implement EntityFilter**

```tsx
// apps/desktop/src/renderer/src/components/EntityFilter/index.tsx
import { cn } from '@reyogo/ui';
import type { IEntity } from '@reyogo/types';

interface EntityFilterProps {
  entities: IEntity[];
  selected: string | null;
  onChange: (entityId: string | null) => void;
}

export function EntityFilter({ entities, selected, onChange }: EntityFilterProps) {
  if (entities.length <= 1) return null;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <button
        onClick={() => onChange(null)}
        className={cn(
          'rounded-full px-3 py-1 text-xs font-medium transition-colors',
          selected === null
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:text-foreground',
        )}
      >
        All
      </button>
      {entities.map((e) => (
        <button
          key={e.id}
          onClick={() => onChange(e.id)}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium transition-colors',
            selected === e.id
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground',
          )}
        >
          {e.name}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run EntityFilter tests**
```bash
pnpm --filter @reyogo/desktop exec vitest run src/renderer/src/components/EntityFilter/index.test.tsx
```
Expected: all pass.

- [ ] **Step 5: Add EntityFilter to inventory table**

In `apps/desktop/src/renderer/src/pages/Inventory/Capture/CapturedInventory/index.tsx`:
```tsx
import { useState } from 'react';
import { useEntities } from '@/Context/EntityContext';
import { EntityFilter } from '@/components/EntityFilter';

// inside component:
const { entities } = useEntities();
const [entityFilter, setEntityFilter] = useState<string | null>(null);

// filter items:
const filteredItems = entityFilter
  ? items.filter((item) => item.entityId === entityFilter)
  : items;

// render filter above table:
<EntityFilter entities={entities} selected={entityFilter} onChange={setEntityFilter} />
```

- [ ] **Step 6: Add EntityFilter to Invoice History**

Same pattern in `apps/desktop/src/renderer/src/pages/Inventory/Invoice/History/index.tsx`. Filter `invoices` list by `invoice.entityId === entityFilter` when filter is set.

- [ ] **Step 7: Add EntityFilter to Costing pages**

In `CostingDashboard/index.tsx` and `CostReport/index.tsx`, add the same `entityFilter` state and pass it as a query param to the relevant data hooks/services. The cost data services already accept `fromDate`/`toDate`; add `entityId?: string` to those calls.

Update `lib/db/src/repositories/stockMovements/index.ts` `getCOGS` to accept optional `entityId` filter and add a `WHERE entity_id = ?` clause when provided.

- [ ] **Step 8: Run all tests**
```bash
pnpm run test
```
Expected: all pass.

- [ ] **Step 9: Commit**
```bash
git add apps/desktop/src/renderer/src/components/EntityFilter/ apps/desktop/src/renderer/src/pages/Inventory/
git commit -m "feat: EntityFilter component; entity filtering on inventory, history, and costing"
```

---

## Task 15: CSV import — Entity column

**Files:**
- Modify: `apps/desktop/src/renderer/src/components/CsvImport/parser/index.ts`
- Modify: `apps/desktop/src/renderer/src/pages/Inventory/Capture/CapturedInventory/ImportPage/components/FormatGuide/index.tsx`

- [ ] **Step 1: Add Entity column to parser**

Read `apps/desktop/src/renderer/src/components/CsvImport/parser/index.ts`. The parser reads CSV rows into typed objects. Add:

- A required `Entity` column
- Validation: look up entity by name (case-insensitive) from the entities list passed to the parser
- If entity name not found → mark the row with an error: `"Entity '{value}' not found. Valid values: {entity names joined by ', '}"`
- If found → attach `entityId` to the parsed item row

The parser likely exports a function like `parseImport(rows, categories, units)`. Update its signature to `parseImport(rows, categories, units, entities)`.

- [ ] **Step 2: Write parser tests for Entity column**

In the existing parser test file (or create `parser/index.test.ts`):
```ts
it('rejects rows where entity name is unrecognised', () => {
  const entities = [{ id: 'e1', name: 'Pub', ... }];
  const result = parseImport([{ ...validRow, Entity: 'Unknown' }], cats, units, entities);
  expect(result[0]!.error).toMatch(/Entity 'Unknown' not found/);
});

it('resolves entityId when entity name matches (case-insensitive)', () => {
  const entities = [{ id: 'e1', name: 'Pub', ... }];
  const result = parseImport([{ ...validRow, Entity: 'pub' }], cats, units, entities);
  expect(result[0]!.entityId).toBe('e1');
  expect(result[0]!.error).toBeUndefined();
});
```

- [ ] **Step 3: Update FormatGuide to document Entity column**

In `FormatGuide/index.tsx`, add a row for the Entity column to the columns table:
```tsx
<tr>
  <td className="font-medium">Entity</td>
  <td>Required</td>
  <td>Name of the entity this item belongs to. Must match an existing entity exactly (case-insensitive).</td>
</tr>
```

- [ ] **Step 4: Run import tests**
```bash
pnpm --filter @reyogo/desktop exec vitest run src/renderer/src/components/CsvImport/
```
Expected: all pass.

- [ ] **Step 5: Commit**
```bash
git add apps/desktop/src/renderer/src/components/CsvImport/ apps/desktop/src/renderer/src/pages/Inventory/Capture/CapturedInventory/ImportPage/
git commit -m "feat: CSV import requires Entity column; validates against known entity names"
```

---

## Task 16: Final typecheck + full test run

- [ ] **Step 1: Run full typecheck**
```bash
pnpm run typecheck
```
Expected: clean — zero errors.

- [ ] **Step 2: Run full test suite**
```bash
pnpm run test
```
Expected: all tests pass.

- [ ] **Step 3: Start the app and smoke test**
```bash
pnpm electron:dev
```
Verify:
- App launches and shows the wizard (first run / `setupComplete=false`)
- Completing the wizard shows the main app
- Settings page accessible from sidebar, entities and VAT config visible
- Invoice capture shows entity selector, items filter by entity
- Inventory table shows EntityFilter when multiple entities exist
- Invoice History shows EntityFilter

- [ ] **Step 4: Final commit**
```bash
git add .
git commit -m "chore: multi-entity support complete — all tests passing"
```
