# Archive & Manage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add archive/delete lifecycle management for inventory items, categories, units of measure, and venues — with a Settings "Manage" page showing usage counts and archive/restore/hard-delete actions.

**Architecture:** Three schema columns added (`archived_at` on `inventory_items`, `inventory_categories`, `units_of_measure`). All existing read queries gain a `WHERE archived_at IS NULL` filter. New repository methods handle archive/restore/hard-delete with usage-count guards. A new Settings sub-page exposes the manage UI with tabs for Items, Categories, and Units.

**Tech Stack:** Electron + React + TypeScript, SQLite via Drizzle ORM (libsql), shadcn/ui, Tailwind, Vitest

---

## File Map

**Created:**
- `lib/db/migrations/0008_archive_columns.sql` — migration adding `archived_at` to three tables
- `apps/desktop/src/renderer/src/pages/Settings/components/ManageSection/index.tsx` — new Settings sub-page (Items / Categories / Units tabs)

**Modified:**
- `lib/db/src/schema/inventoryItems/index.ts` — add `archivedAt` column
- `lib/db/src/schema/inventoryCategories/index.ts` — add `archivedAt` column
- `lib/db/src/schema/unitsOfMeasure/index.ts` — add `archivedAt` column
- `lib/db/src/repositories/inventory/index.ts` — filter archived, add archive/restore/delete/usageCount methods
- `lib/db/src/repositories/setup/index.ts` — filter archived, add archive/restore/delete/usageCount methods
- `lib/db/src/repositories/inventory/index.test.ts` — tests for new methods
- `lib/db/src/repositories/setup/index.test.ts` — tests for new methods
- `apps/desktop/src/shared/types/ipc/invoke-map.ts` — 10 new IPC channels
- `apps/desktop/src/main/handlers/inventory/index.ts` — register new channels
- `apps/desktop/src/main/handlers/setup/index.ts` — register new channels
- `apps/desktop/src/renderer/src/pages/Settings/index.tsx` — add ManageSection
- `apps/desktop/src/renderer/src/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext/index.tsx` — expose archive/restore methods; categories/units already filtered server-side

---

### Task 1: DB schema — add `archived_at` column to three tables

**Files:**
- Modify: `lib/db/src/schema/inventoryItems/index.ts`
- Modify: `lib/db/src/schema/inventoryCategories/index.ts`
- Modify: `lib/db/src/schema/unitsOfMeasure/index.ts`
- Create: `lib/db/migrations/0008_archive_columns.sql`

- [ ] **Step 1: Add `archivedAt` to inventoryItems schema**

In `lib/db/src/schema/inventoryItems/index.ts`, add after `updatedAt`:

```typescript
archivedAt: integer('archived_at', { mode: 'timestamp' }),
```

Full file after change:
```typescript
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
  archivedAt: integer('archived_at', { mode: 'timestamp' }),
});
export type InventoryItemRow = typeof inventoryItems.$inferSelect;
export type NewInventoryItemRow = typeof inventoryItems.$inferInsert;
```

- [ ] **Step 2: Add `archivedAt` to inventoryCategories schema**

In `lib/db/src/schema/inventoryCategories/index.ts`, add after `updatedAt`:

```typescript
archivedAt: integer('archived_at', { mode: 'timestamp' }),
```

- [ ] **Step 3: Add `archivedAt` to unitsOfMeasure schema**

In `lib/db/src/schema/unitsOfMeasure/index.ts`, add after `createdAt`:

```typescript
archivedAt: integer('archived_at', { mode: 'timestamp' }),
```

Full file after change:
```typescript
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { accounts } from '../accounts';

export const unitsOfMeasure = sqliteTable('units_of_measure', {
  id: text('id').primaryKey(),
  accountId: text('account_id')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  archivedAt: integer('archived_at', { mode: 'timestamp' }),
});
export type UnitOfMeasureRow = typeof unitsOfMeasure.$inferSelect;
export type NewUnitOfMeasureRow = typeof unitsOfMeasure.$inferInsert;
```

- [ ] **Step 4: Create migration file**

Create `lib/db/migrations/0008_archive_columns.sql`:

```sql
ALTER TABLE `inventory_items` ADD `archived_at` integer;--> statement-breakpoint
ALTER TABLE `inventory_categories` ADD `archived_at` integer;--> statement-breakpoint
ALTER TABLE `units_of_measure` ADD `archived_at` integer;
```

- [ ] **Step 5: Generate Drizzle meta for migration**

Run from repo root:
```bash
pnpm --filter @reyogo/db run db:generate
```

Check that the new migration file appears in `lib/db/migrations/meta/`. If Drizzle generates a different filename (e.g. `0008_something_else.sql`), rename your hand-written file to match OR delete the generated one and keep yours — whichever matches the meta `_journal.json` entries.

> **Important:** The migration filename must match what's in `lib/db/migrations/meta/_journal.json`. Open that file and add an entry for `0008_archive_columns` if it's missing:
> ```json
> { "idx": 8, "version": "6", "when": 1748520000000, "tag": "0008_archive_columns", "breakpoints": true }
> ```

- [ ] **Step 6: Verify typecheck passes**

```bash
pnpm run typecheck
```
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add lib/db/src/schema/inventoryItems/index.ts \
        lib/db/src/schema/inventoryCategories/index.ts \
        lib/db/src/schema/unitsOfMeasure/index.ts \
        lib/db/migrations/0008_archive_columns.sql \
        lib/db/migrations/meta/
git commit -m "feat(db): add archived_at column to items, categories, units"
```

---

### Task 2: Inventory repository — archive/restore/delete/usageCount

**Files:**
- Modify: `lib/db/src/repositories/inventory/index.ts`
- Modify: `lib/db/src/repositories/inventory/index.test.ts`

- [ ] **Step 1: Write failing tests**

Add to `lib/db/src/repositories/inventory/index.test.ts` (append after the existing `submitInventory` describe block):

```typescript
describe('archiveItem / restoreItem / hardDeleteItem', () => {
  beforeEach(async () => {
    await repo.upsertCategory({ id: 'cat-1', name: 'Food', type: InventoryType.Food });
    await repo.upsertItem({
      id: 'item-1',
      entityId: 'default',
      name: 'Chips',
      categoryId: 'cat-1',
      unitOfMeasureId: null,
      sku: null,
      reorderPoint: null,
      reorderQty: null,
    });
  });

  it('archiveItem sets archived_at and item disappears from getItems', async () => {
    await repo.archiveItem('item-1');
    const items = await repo.getItems();
    expect(items.find((i) => i.id === 'item-1')).toBeUndefined();
  });

  it('restoreItem clears archived_at and item reappears in getItems', async () => {
    await repo.archiveItem('item-1');
    await repo.restoreItem('item-1');
    const items = await repo.getItems();
    expect(items.find((i) => i.id === 'item-1')).toBeDefined();
  });

  it('getArchivedItems returns only archived items', async () => {
    await repo.archiveItem('item-1');
    const archived = await repo.getArchivedItems();
    expect(archived.map((i) => i.id)).toContain('item-1');
  });

  it('hardDeleteItem removes item with zero usage', async () => {
    await repo.hardDeleteItem('item-1');
    const rows = await db.select().from(schema.inventoryItems);
    expect(rows).toHaveLength(0);
  });

  it('getItemUsageCount returns 0 for unused item', async () => {
    expect(await repo.getItemUsageCount('item-1')).toBe(0);
  });
});

describe('archiveCategory / restoreCategory / hardDeleteCategory', () => {
  beforeEach(async () => {
    await repo.upsertCategory({ id: 'cat-1', name: 'Food', type: InventoryType.Food });
  });

  it('archiveCategory sets archived_at and category disappears from getCategories', async () => {
    await repo.archiveCategory('cat-1');
    const cats = await repo.getCategories();
    expect(cats.find((c) => c.id === 'cat-1')).toBeUndefined();
  });

  it('restoreCategory clears archived_at', async () => {
    await repo.archiveCategory('cat-1');
    await repo.restoreCategory('cat-1');
    const cats = await repo.getCategories();
    expect(cats.find((c) => c.id === 'cat-1')).toBeDefined();
  });

  it('getArchivedCategories returns only archived', async () => {
    await repo.archiveCategory('cat-1');
    const archived = await repo.getArchivedCategories();
    expect(archived.map((c) => c.id)).toContain('cat-1');
  });

  it('hardDeleteCategory removes category with zero usage', async () => {
    await repo.hardDeleteCategory('cat-1');
    expect(await db.select().from(schema.inventoryCategories)).toHaveLength(0);
  });

  it('getCategoryUsageCount returns 0 for empty category', async () => {
    expect(await repo.getCategoryUsageCount('cat-1')).toBe(0);
  });

  it('getCategoryUsageCount counts assigned items', async () => {
    await repo.upsertItem({
      id: 'item-1', entityId: 'default', name: 'Chips',
      categoryId: 'cat-1', unitOfMeasureId: null, sku: null,
      reorderPoint: null, reorderQty: null,
    });
    expect(await repo.getCategoryUsageCount('cat-1')).toBe(1);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
pnpm --filter @reyogo/desktop exec vitest run lib/db/src/repositories/inventory/index.test.ts
```
Expected: FAIL — `repo.archiveItem is not a function` (or similar).

- [ ] **Step 3: Implement new repository methods**

Replace the entire `lib/db/src/repositories/inventory/index.ts` with:

```typescript
import { asc, count, desc, eq, isNotNull, isNull, sql } from 'drizzle-orm';
import type {
  Category,
  InventoryItem,
  InventoryItemInput,
  InventorySubmitPayload,
} from '@reyogo/types';
import type { DbClient } from '../../client';
import * as schema from '../../schema';
import { now } from '../../utils/timestamps';

export function createInventoryRepo(db: DbClient) {
  return {
    // ── Categories ────────────────────────────────────────────────

    async getCategories(): Promise<Category[]> {
      const rows = await db
        .select()
        .from(schema.inventoryCategories)
        .where(isNull(schema.inventoryCategories.archivedAt))
        .orderBy(schema.inventoryCategories.name);
      return rows.map((r) => ({ id: r.id, name: r.name, type: r.type }));
    },

    async getArchivedCategories(): Promise<Category[]> {
      const rows = await db
        .select()
        .from(schema.inventoryCategories)
        .where(isNotNull(schema.inventoryCategories.archivedAt))
        .orderBy(schema.inventoryCategories.name);
      return rows.map((r) => ({ id: r.id, name: r.name, type: r.type }));
    },

    async getCategoryUsageCount(id: string): Promise<number> {
      const [row] = await db
        .select({ n: count() })
        .from(schema.inventoryItems)
        .where(eq(schema.inventoryItems.categoryId, id));
      return row?.n ?? 0;
    },

    async archiveCategory(id: string): Promise<void> {
      await db
        .update(schema.inventoryCategories)
        .set({ archivedAt: now() })
        .where(eq(schema.inventoryCategories.id, id));
    },

    async restoreCategory(id: string): Promise<void> {
      await db
        .update(schema.inventoryCategories)
        .set({ archivedAt: null })
        .where(eq(schema.inventoryCategories.id, id));
    },

    async hardDeleteCategory(id: string): Promise<void> {
      const usage = await this.getCategoryUsageCount(id);
      if (usage > 0) throw new Error(`Category has ${usage} assigned items and cannot be deleted.`);
      await db.delete(schema.inventoryCategories).where(eq(schema.inventoryCategories.id, id));
    },

    // ── Items ────────────────────────────────────────────────────

    async getItems(entityId?: string): Promise<InventoryItem[]> {
      const itemRows = await db
        .select()
        .from(schema.inventoryItems)
        .where(
          entityId
            ? sql`${schema.inventoryItems.entityId} = ${entityId} AND ${schema.inventoryItems.archivedAt} IS NULL`
            : isNull(schema.inventoryItems.archivedAt),
        )
        .orderBy(asc(schema.inventoryItems.name));
      const movementRows = await db
        .select({
          inventoryItemId: schema.stockMovements.inventoryItemId,
          stockQtyAfter: schema.stockMovements.stockQtyAfter,
          weightedAvgCostAfter: schema.stockMovements.weightedAvgCostAfter,
        })
        .from(schema.stockMovements)
        .orderBy(desc(schema.stockMovements.occurredAt), desc(schema.stockMovements.createdAt));
      const latestMovement = new Map<
        string,
        { stockQtyAfter: number; weightedAvgCostAfter: number | null }
      >();
      for (const m of movementRows) {
        if (!latestMovement.has(m.inventoryItemId)) {
          latestMovement.set(m.inventoryItemId, {
            stockQtyAfter: m.stockQtyAfter,
            weightedAvgCostAfter: m.weightedAvgCostAfter,
          });
        }
      }
      return itemRows.map((row) => {
        const movement = latestMovement.get(row.id);
        return {
          id: row.id,
          entityId: row.entityId,
          name: row.name,
          categoryId: row.categoryId,
          unitOfMeasureId: row.unitOfMeasureId ?? null,
          sku: row.sku ?? null,
          currentStockQty: movement?.stockQtyAfter ?? 0,
          currentWeightedAvgCost: movement?.weightedAvgCostAfter ?? null,
          reorderPoint: row.reorderPoint ?? null,
          reorderQty: row.reorderQty ?? null,
        };
      });
    },

    async getArchivedItems(): Promise<InventoryItem[]> {
      const rows = await db
        .select()
        .from(schema.inventoryItems)
        .where(isNotNull(schema.inventoryItems.archivedAt))
        .orderBy(asc(schema.inventoryItems.name));
      return rows.map((row) => ({
        id: row.id,
        entityId: row.entityId,
        name: row.name,
        categoryId: row.categoryId,
        unitOfMeasureId: row.unitOfMeasureId ?? null,
        sku: row.sku ?? null,
        currentStockQty: 0,
        currentWeightedAvgCost: null,
        reorderPoint: row.reorderPoint ?? null,
        reorderQty: row.reorderQty ?? null,
      }));
    },

    async getItemUsageCount(id: string): Promise<number> {
      const [lines] = await db
        .select({ n: count() })
        .from(schema.invoiceLineItems)
        .where(eq(schema.invoiceLineItems.inventoryItemId, id));
      const [movements] = await db
        .select({ n: count() })
        .from(schema.stockMovements)
        .where(eq(schema.stockMovements.inventoryItemId, id));
      return (lines?.n ?? 0) + (movements?.n ?? 0);
    },

    async archiveItem(id: string): Promise<void> {
      await db
        .update(schema.inventoryItems)
        .set({ archivedAt: now() })
        .where(eq(schema.inventoryItems.id, id));
    },

    async restoreItem(id: string): Promise<void> {
      await db
        .update(schema.inventoryItems)
        .set({ archivedAt: null })
        .where(eq(schema.inventoryItems.id, id));
    },

    async hardDeleteItem(id: string): Promise<void> {
      const usage = await this.getItemUsageCount(id);
      if (usage > 0) throw new Error(`Item has ${usage} usages and cannot be deleted.`);
      await db.delete(schema.inventoryItems).where(eq(schema.inventoryItems.id, id));
    },

    // ── Legacy upsert/submit (unchanged) ────────────────────────

    async upsertCategory(category: Category): Promise<void> {
      const ts = now();
      await db
        .insert(schema.inventoryCategories)
        .values({
          id: category.id,
          accountId: 'default',
          name: category.name,
          type: category.type,
          createdAt: ts,
          updatedAt: ts,
        })
        .onConflictDoUpdate({
          target: schema.inventoryCategories.id,
          set: { name: category.name, type: category.type, updatedAt: ts },
        });
    },

    async upsertItem(item: InventoryItemInput): Promise<void> {
      const ts = now();
      await db
        .insert(schema.inventoryItems)
        .values({
          id: item.id,
          accountId: 'default',
          entityId: item.entityId,
          name: item.name,
          categoryId: item.categoryId,
          unitOfMeasureId: item.unitOfMeasureId ?? null,
          sku: item.sku ?? null,
          reorderPoint: item.reorderPoint ?? null,
          reorderQty: item.reorderQty ?? null,
          createdAt: ts,
          updatedAt: ts,
        })
        .onConflictDoUpdate({
          target: schema.inventoryItems.id,
          set: {
            entityId: item.entityId,
            name: item.name,
            categoryId: item.categoryId,
            unitOfMeasureId: item.unitOfMeasureId ?? null,
            sku: item.sku ?? null,
            reorderPoint: item.reorderPoint ?? null,
            reorderQty: item.reorderQty ?? null,
            updatedAt: ts,
          },
        });
    },

    async submitInventory(payload: InventorySubmitPayload): Promise<void> {
      for (const cat of payload.addedCategories) await this.upsertCategory(cat);
      for (const cat of payload.updatedCategories) await this.upsertCategory(cat);
      for (const item of payload.addedItems) await this.upsertItem(item);
      for (const item of payload.updatedItems) await this.upsertItem(item);
      for (const id of payload.deletedCategoryIds)
        await db.delete(schema.inventoryCategories).where(eq(schema.inventoryCategories.id, id));
      for (const id of payload.deletedItemIds)
        await db.delete(schema.inventoryItems).where(eq(schema.inventoryItems.id, id));
    },

    async deleteCategory(id: string): Promise<void> {
      await db.delete(schema.inventoryCategories).where(eq(schema.inventoryCategories.id, id));
    },

    async deleteItem(id: string): Promise<void> {
      await db.delete(schema.inventoryItems).where(eq(schema.inventoryItems.id, id));
    },
  };
}
```

- [ ] **Step 4: Run tests**

```bash
pnpm --filter @reyogo/desktop exec vitest run lib/db/src/repositories/inventory/index.test.ts
```
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add lib/db/src/repositories/inventory/index.ts lib/db/src/repositories/inventory/index.test.ts
git commit -m "feat(repo): archive/restore/hardDelete for items and categories"
```

---

### Task 3: Setup repository — archive/restore/delete/usageCount for units

**Files:**
- Modify: `lib/db/src/repositories/setup/index.ts`
- Modify: `lib/db/src/repositories/setup/index.test.ts`

- [ ] **Step 1: Write failing tests**

Append to `lib/db/src/repositories/setup/index.test.ts`:

```typescript
import { createSetupRepo } from '.';
import { createTestDb, type DbClient } from '../../__tests__/helpers';
import * as schema from '../../schema';
import { describe, it, expect, beforeEach } from 'vitest';

let db: DbClient;
let repo: ReturnType<typeof createSetupRepo>;

beforeEach(async () => {
  db = await createTestDb();
  repo = createSetupRepo(db);
});

describe('archiveUnit / restoreUnit / hardDeleteUnit', () => {
  beforeEach(async () => {
    await repo.upsertUnit({ id: 'unit-1', name: 'litres' });
  });

  it('archiveUnit hides unit from getUnits', async () => {
    await repo.archiveUnit('unit-1');
    const units = await repo.getUnits();
    expect(units.find((u) => u.id === 'unit-1')).toBeUndefined();
  });

  it('restoreUnit makes unit visible again', async () => {
    await repo.archiveUnit('unit-1');
    await repo.restoreUnit('unit-1');
    const units = await repo.getUnits();
    expect(units.find((u) => u.id === 'unit-1')).toBeDefined();
  });

  it('getArchivedUnits returns archived units', async () => {
    await repo.archiveUnit('unit-1');
    const archived = await repo.getArchivedUnits();
    expect(archived.map((u) => u.id)).toContain('unit-1');
  });

  it('hardDeleteUnit removes unit with zero usage', async () => {
    await repo.hardDeleteUnit('unit-1');
    expect(await db.select().from(schema.unitsOfMeasure)).toHaveLength(0);
  });

  it('getUnitUsageCount returns 0 for unused unit', async () => {
    expect(await repo.getUnitUsageCount('unit-1')).toBe(0);
  });
});
```

- [ ] **Step 2: Run to confirm failure**

```bash
pnpm --filter @reyogo/desktop exec vitest run lib/db/src/repositories/setup/index.test.ts
```
Expected: FAIL.

- [ ] **Step 3: Implement**

Replace `lib/db/src/repositories/setup/index.ts`:

```typescript
import { count, eq, isNotNull, isNull } from 'drizzle-orm';
import type { UnitOfMeasure } from '@reyogo/types';
import type { DbClient } from '../../client';
import * as schema from '../../schema';
import { now } from '../../utils/timestamps';

export function createSetupRepo(db: DbClient) {
  return {
    async getUnits(): Promise<UnitOfMeasure[]> {
      const rows = await db
        .select()
        .from(schema.unitsOfMeasure)
        .where(isNull(schema.unitsOfMeasure.archivedAt))
        .orderBy(schema.unitsOfMeasure.createdAt);
      return rows.map((r) => ({ id: r.id, name: r.name }));
    },

    async getArchivedUnits(): Promise<UnitOfMeasure[]> {
      const rows = await db
        .select()
        .from(schema.unitsOfMeasure)
        .where(isNotNull(schema.unitsOfMeasure.archivedAt))
        .orderBy(schema.unitsOfMeasure.createdAt);
      return rows.map((r) => ({ id: r.id, name: r.name }));
    },

    async getUnitUsageCount(id: string): Promise<number> {
      const [items] = await db
        .select({ n: count() })
        .from(schema.inventoryItems)
        .where(eq(schema.inventoryItems.unitOfMeasureId, id));
      return items?.n ?? 0;
    },

    async archiveUnit(id: string): Promise<void> {
      await db
        .update(schema.unitsOfMeasure)
        .set({ archivedAt: now() })
        .where(eq(schema.unitsOfMeasure.id, id));
    },

    async restoreUnit(id: string): Promise<void> {
      await db
        .update(schema.unitsOfMeasure)
        .set({ archivedAt: null })
        .where(eq(schema.unitsOfMeasure.id, id));
    },

    async hardDeleteUnit(id: string): Promise<void> {
      const usage = await this.getUnitUsageCount(id);
      if (usage > 0) throw new Error(`Unit has ${usage} items using it and cannot be deleted.`);
      await db.delete(schema.unitsOfMeasure).where(eq(schema.unitsOfMeasure.id, id));
    },

    async upsertUnit(unit: UnitOfMeasure): Promise<void> {
      await db
        .insert(schema.unitsOfMeasure)
        .values({ id: unit.id, accountId: 'default', name: unit.name, createdAt: now() })
        .onConflictDoUpdate({ target: schema.unitsOfMeasure.id, set: { name: unit.name } });
    },

    async deleteUnit(id: string): Promise<void> {
      await db.delete(schema.unitsOfMeasure).where(eq(schema.unitsOfMeasure.id, id));
    },
  };
}
```

- [ ] **Step 4: Run tests**

```bash
pnpm --filter @reyogo/desktop exec vitest run lib/db/src/repositories/setup/index.test.ts
```
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add lib/db/src/repositories/setup/index.ts lib/db/src/repositories/setup/index.test.ts
git commit -m "feat(repo): archive/restore/hardDelete for units of measure"
```

---

### Task 4: IPC channels + handlers

**Files:**
- Modify: `apps/desktop/src/shared/types/ipc/invoke-map.ts`
- Modify: `apps/desktop/src/main/handlers/inventory/index.ts`
- Modify: `apps/desktop/src/main/handlers/setup/index.ts`

- [ ] **Step 1: Add 10 new IPC channel types**

In `apps/desktop/src/shared/types/ipc/invoke-map.ts`, after the existing `'inventory:delete-item'` line, add:

```typescript
  'inventory:archive-item': { args: [id: string]; return: void };
  'inventory:restore-item': { args: [id: string]; return: void };
  'inventory:hard-delete-item': { args: [id: string]; return: void };
  'inventory:get-item-usage-count': { args: [id: string]; return: number };
  'inventory:get-archived-items': { args: []; return: InventoryItem[] };
  'inventory:archive-category': { args: [id: string]; return: void };
  'inventory:restore-category': { args: [id: string]; return: void };
  'inventory:hard-delete-category': { args: [id: string]; return: void };
  'inventory:get-category-usage-count': { args: [id: string]; return: number };
  'inventory:get-archived-categories': { args: []; return: Category[] };
```

After the existing `'setup:delete-unit'` line, add:

```typescript
  'setup:archive-unit': { args: [id: string]; return: void };
  'setup:restore-unit': { args: [id: string]; return: void };
  'setup:hard-delete-unit': { args: [id: string]; return: void };
  'setup:get-unit-usage-count': { args: [id: string]; return: number };
  'setup:get-archived-units': { args: []; return: UnitOfMeasure[] };
```

Note: `UnitOfMeasure` is already imported via `@reyogo/types` at the top of the file. `InventoryItem` and `Category` are also already imported.

- [ ] **Step 2: Register inventory handlers**

In `apps/desktop/src/main/handlers/inventory/index.ts`, append inside `registerInventoryHandlers()` before the closing `}`:

```typescript
  ipcMain.handle('inventory:archive-item', (_e, id: string) =>
    getRepos().inventory.archiveItem(id),
  );
  ipcMain.handle('inventory:restore-item', (_e, id: string) =>
    getRepos().inventory.restoreItem(id),
  );
  ipcMain.handle('inventory:hard-delete-item', (_e, id: string) =>
    getRepos().inventory.hardDeleteItem(id),
  );
  ipcMain.handle('inventory:get-item-usage-count', (_e, id: string) =>
    getRepos().inventory.getItemUsageCount(id),
  );
  ipcMain.handle('inventory:get-archived-items', () =>
    getRepos().inventory.getArchivedItems(),
  );
  ipcMain.handle('inventory:archive-category', (_e, id: string) =>
    getRepos().inventory.archiveCategory(id),
  );
  ipcMain.handle('inventory:restore-category', (_e, id: string) =>
    getRepos().inventory.restoreCategory(id),
  );
  ipcMain.handle('inventory:hard-delete-category', (_e, id: string) =>
    getRepos().inventory.hardDeleteCategory(id),
  );
  ipcMain.handle('inventory:get-category-usage-count', (_e, id: string) =>
    getRepos().inventory.getCategoryUsageCount(id),
  );
  ipcMain.handle('inventory:get-archived-categories', () =>
    getRepos().inventory.getArchivedCategories(),
  );
```

- [ ] **Step 3: Register setup handlers**

In `apps/desktop/src/main/handlers/setup/index.ts`, append inside `registerSetupHandlers()`:

```typescript
  ipcMain.handle('setup:archive-unit', (_e, id: string) =>
    getRepos().setup.archiveUnit(id),
  );
  ipcMain.handle('setup:restore-unit', (_e, id: string) =>
    getRepos().setup.restoreUnit(id),
  );
  ipcMain.handle('setup:hard-delete-unit', (_e, id: string) =>
    getRepos().setup.hardDeleteUnit(id),
  );
  ipcMain.handle('setup:get-unit-usage-count', (_e, id: string) =>
    getRepos().setup.getUnitUsageCount(id),
  );
  ipcMain.handle('setup:get-archived-units', () =>
    getRepos().setup.getArchivedUnits(),
  );
```

- [ ] **Step 4: Typecheck**

```bash
pnpm run typecheck
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add apps/desktop/src/shared/types/ipc/invoke-map.ts \
        apps/desktop/src/main/handlers/inventory/index.ts \
        apps/desktop/src/main/handlers/setup/index.ts
git commit -m "feat(ipc): archive/restore/hardDelete channels for items, categories, units"
```

---

### Task 5: Settings — Manage page UI

**Files:**
- Create: `apps/desktop/src/renderer/src/pages/Settings/components/ManageSection/index.tsx`
- Modify: `apps/desktop/src/renderer/src/pages/Settings/index.tsx`

The Manage page shows three tabs: Items | Categories | Units. Each row displays: name, a usage count badge ("0 uses" / "3 uses"), and action buttons. Rules:
- `usageCount === 0` and not archived → Delete button (hard delete)
- `usageCount > 0` and not archived → Archive button
- archived → Restore button + Delete button (always safe to hard-delete an archived item with no remaining usage? No — archived means historical usage existed. Always show Restore; show Delete only if usage is 0.)

Wait — if an item is archived, it means it *had* usage historically. Hard delete is still blocked if usage > 0. So archived rows show Restore only (never Delete), unless somehow usage drops to 0 (very edge case). Keep it simple: archived rows only show Restore.

- [ ] **Step 1: Create ManageSection component**

Create `apps/desktop/src/renderer/src/pages/Settings/components/ManageSection/index.tsx`:

```typescript
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@reyogo/ui';
import { cn } from '@reyogo/ui';
import type { Category, InventoryItem, UnitOfMeasure } from '@reyogo/types';
import { SectionHeader } from '../SectionHeader';

type Tab = 'items' | 'categories' | 'units';

type ManagedRow = {
  id: string;
  name: string;
  usageCount: number;
  archived: boolean;
};

function invoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  return window.electronAPI.ipcRenderer.invoke(channel as never, ...args) as Promise<T>;
}

function UsageBadge({ count }: { count: number }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
        count === 0
          ? 'bg-muted text-muted-foreground'
          : 'bg-amber-500/10 text-amber-600',
      )}
    >
      {count === 0 ? 'unused' : `${count} use${count === 1 ? '' : 's'}`}
    </span>
  );
}

function ManageTable({
  rows,
  onArchive,
  onRestore,
  onDelete,
}: {
  rows: ManagedRow[];
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const active = rows.filter((r) => !r.archived);
  const archived = rows.filter((r) => r.archived);
  const [showArchived, setShowArchived] = useState(false);

  const visible = showArchived ? [...active, ...archived] : active;

  if (visible.length === 0 && !showArchived) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        Nothing here yet.
        {archived.length > 0 && (
          <button
            type="button"
            onClick={() => setShowArchived(true)}
            className="ml-2 text-[var(--nav-active-border)] hover:underline"
          >
            Show {archived.length} archived
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {archived.length > 0 && (
        <div className="flex justify-end pb-1">
          <button
            type="button"
            onClick={() => setShowArchived((v) => !v)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showArchived ? 'Hide archived' : `Show ${archived.length} archived`}
          </button>
        </div>
      )}
      <div className="rounded-lg border border-[var(--nav-border)] divide-y divide-[var(--nav-border)] overflow-hidden">
        {visible.map((row) => (
          <div
            key={row.id}
            className={cn(
              'flex items-center justify-between gap-3 px-4 py-2.5',
              row.archived && 'opacity-50',
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={cn(
                  'text-sm font-medium text-foreground truncate',
                  row.archived && 'line-through text-muted-foreground',
                )}
              >
                {row.name}
              </span>
              <UsageBadge count={row.usageCount} />
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {row.archived ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onRestore(row.id)}
                >
                  Restore
                </Button>
              ) : row.usageCount === 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => onDelete(row.id)}
                >
                  Delete
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => onArchive(row.id)}
                  title="This has history — archive instead of delete to preserve records"
                >
                  Archive
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ManageSection() {
  const [tab, setTab] = useState<Tab>('items');
  const [itemRows, setItemRows] = useState<ManagedRow[]>([]);
  const [catRows, setCatRows] = useState<ManagedRow[]>([]);
  const [unitRows, setUnitRows] = useState<ManagedRow[]>([]);
  const [loading, setLoading] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    const [active, archived] = await Promise.all([
      invoke<InventoryItem[]>('inventory:get-items'),
      invoke<InventoryItem[]>('inventory:get-archived-items'),
    ]);
    const counts = await Promise.all(
      [...active, ...archived].map((i) =>
        invoke<number>('inventory:get-item-usage-count', i.id),
      ),
    );
    const all = [...active, ...archived];
    setItemRows(
      all.map((item, idx) => ({
        id: item.id,
        name: item.name,
        usageCount: counts[idx] ?? 0,
        archived: idx >= active.length,
      })),
    );
    setLoading(false);
  }, []);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    const [active, archived] = await Promise.all([
      invoke<Category[]>('inventory:get-categories'),
      invoke<Category[]>('inventory:get-archived-categories'),
    ]);
    const counts = await Promise.all(
      [...active, ...archived].map((c) =>
        invoke<number>('inventory:get-category-usage-count', c.id),
      ),
    );
    const all = [...active, ...archived];
    setCatRows(
      all.map((cat, idx) => ({
        id: cat.id,
        name: cat.name,
        usageCount: counts[idx] ?? 0,
        archived: idx >= active.length,
      })),
    );
    setLoading(false);
  }, []);

  const loadUnits = useCallback(async () => {
    setLoading(true);
    const [active, archived] = await Promise.all([
      invoke<UnitOfMeasure[]>('setup:get-units'),
      invoke<UnitOfMeasure[]>('setup:get-archived-units'),
    ]);
    const counts = await Promise.all(
      [...active, ...archived].map((u) =>
        invoke<number>('setup:get-unit-usage-count', u.id),
      ),
    );
    const all = [...active, ...archived];
    setUnitRows(
      all.map((unit, idx) => ({
        id: unit.id,
        name: unit.name,
        usageCount: counts[idx] ?? 0,
        archived: idx >= active.length,
      })),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    if (tab === 'items') loadItems();
    else if (tab === 'categories') loadCategories();
    else loadUnits();
  }, [tab, loadItems, loadCategories, loadUnits]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'items', label: 'Items' },
    { key: 'categories', label: 'Categories' },
    { key: 'units', label: 'Units' },
  ];

  const rows = tab === 'items' ? itemRows : tab === 'categories' ? catRows : unitRows;

  const handleArchive = useCallback(
    async (id: string) => {
      if (tab === 'items') await invoke('inventory:archive-item', id);
      else if (tab === 'categories') await invoke('inventory:archive-category', id);
      else await invoke('setup:archive-unit', id);
      if (tab === 'items') loadItems();
      else if (tab === 'categories') loadCategories();
      else loadUnits();
    },
    [tab, loadItems, loadCategories, loadUnits],
  );

  const handleRestore = useCallback(
    async (id: string) => {
      if (tab === 'items') await invoke('inventory:restore-item', id);
      else if (tab === 'categories') await invoke('inventory:restore-category', id);
      else await invoke('setup:restore-unit', id);
      if (tab === 'items') loadItems();
      else if (tab === 'categories') loadCategories();
      else loadUnits();
    },
    [tab, loadItems, loadCategories, loadUnits],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (tab === 'items') await invoke('inventory:hard-delete-item', id);
      else if (tab === 'categories') await invoke('inventory:hard-delete-category', id);
      else await invoke('setup:hard-delete-unit', id);
      if (tab === 'items') loadItems();
      else if (tab === 'categories') loadCategories();
      else loadUnits();
    },
    [tab, loadItems, loadCategories, loadUnits],
  );

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title="Manage"
        description="Archive items that have history to preserve records, or delete unused ones entirely."
      />

      <div className="inline-flex items-center rounded-lg border border-[var(--nav-border)] bg-muted/20 p-0.5 gap-0.5">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-medium transition-all duration-150',
              tab === t.key
                ? 'bg-[var(--nav-active-border)]/15 text-[var(--nav-active-border)] shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground py-4">Loading…</p>
      ) : (
        <ManageTable
          rows={rows}
          onArchive={handleArchive}
          onRestore={handleRestore}
          onDelete={handleDelete}
        />
      )}
    </section>
  );
}
```

- [ ] **Step 2: Add ManageSection to Settings page**

In `apps/desktop/src/renderer/src/pages/Settings/index.tsx`, add the import and section:

```typescript
import { useEntities } from '@/Context/EntityContext';
import { BusinessSection } from './components/BusinessSection';
import { EntitiesSection } from './components/EntitiesSection';
import { TaxSection } from './components/TaxSection';
import { ManageSection } from './components/ManageSection';

export default function SettingsPage() {
  const { group, entities, refetchEntities } = useEntities();

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-2xl px-8 py-8 flex flex-col gap-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your business, venues, and tax configuration.
          </p>
        </div>
        <BusinessSection group={group} onSaved={refetchEntities} />
        <EntitiesSection entities={entities} onSaved={refetchEntities} />
        <TaxSection entities={entities} onSaved={refetchEntities} />
        <ManageSection />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

```bash
pnpm run typecheck
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/desktop/src/renderer/src/pages/Settings/components/ManageSection/index.tsx \
        apps/desktop/src/renderer/src/pages/Settings/index.tsx
git commit -m "feat(ui): Manage section in Settings for archive/delete of items, categories, units"
```

---

### Task 6: Final — typecheck, full test run, verify migration loads

- [ ] **Step 1: Run full test suite**

```bash
pnpm run test
```
Expected: all tests pass.

- [ ] **Step 2: Run typecheck**

```bash
pnpm run typecheck
```
Expected: no errors.

- [ ] **Step 3: Verify migration applies cleanly**

Start the dev app to confirm the migration runs without error:
```bash
pnpm electron:dev
```
Look for SQLite migration success in the main process logs. If you see `Cannot add a NOT NULL column with default value NULL`, re-check Task 1 — the new columns must be nullable (no `.notNull()`).

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: final typecheck and test verification for archive/manage feature"
```
