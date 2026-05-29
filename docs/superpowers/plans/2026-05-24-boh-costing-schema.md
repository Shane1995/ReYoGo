# BOH Costing Schema — Pub & Restaurant Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add yield factors, par levels, and a physical stocktake system to the `@reyogo/db` schema so a small pub and restaurant can accurately track food cost percentage and reconcile physical vs book stock.

**Architecture:** Three tasks: database docs first (no code changes), then two focused schema additions to `lib/db/src/schema.ts`, each followed by a Drizzle migration generation step. New types land in `lib/types/src/`, new repositories in `lib/db/src/repositories/`. Tasks 2 and 3 are independently testable but share the same migration chain, so Task 2 must be committed before Task 3 begins.

**Tech Stack:** Drizzle ORM (SQLite / libSQL dialect), `@libsql/client`, Vitest, TypeScript, pnpm workspaces.

---

## Background

The schema already has a solid WAC (weighted average cost) ledger via `stock_movements` and a clean invoice capture system. The gaps blocking real BOH use are:

1. `InventoryType` is `string` — no enforcement of `food | beverage | non-food` split needed for GP reporting. These three values are industry-standard for a pub P&L and are enforced both as a TypeScript union and a SQLite `CHECK` constraint.
2. No `yield_factor` on items — a whole chicken at £5/kg has an edible yield of ~75%, making real cost £6.67/kg.
3. No par levels — can't tell staff when to reorder beer or spirits.
4. No physical stocktake — can't close a period, calculate actual usage, or spot shrinkage.

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `lib/db/README.md` | **Create** | Human-readable database schema reference for the whole team |
| `lib/types/src/inventory/index.ts` | Modify | Add `InventoryType` union; add yield/par fields to `IInventoryItem` |
| `lib/types/src/stockCounts/index.ts` | **Create** | All types for stock count sessions and lines |
| `lib/types/src/index.ts` | Modify | Export new `stockCounts` types |
| `lib/db/src/schema.ts` | Modify (x2) | Add columns to `inventoryItems`; add `stockCountSessions` and `stockCountLines` tables |
| `lib/db/src/repositories/inventory.ts` | Modify | Include new fields in `toItem` and `upsertItem` |
| `lib/db/src/repositories/stockCounts.ts` | **Create** | CRUD + `completeSession` logic |
| `lib/db/src/index.ts` | Modify | Export `createStockCountsRepo` |
| `lib/db/src/__tests__/inventory.test.ts` | Modify | Update type values; add yield/par assertions |
| `lib/db/src/__tests__/stockCounts.test.ts` | **Create** | Full test coverage for stock count repo |

---

## Task 1: Database Documentation

Write `lib/db/README.md` before any code changes so there's a committed human-readable reference for the schema as it stands, plus a note on what Tasks 2 and 3 will add.

**Files:**
- Create: `lib/db/README.md`

- [ ] **Step 1.1: Create the database README**

The file to create is `lib/db/README.md`. Its contents are the full database reference document — see the committed file at that path. (This task is pre-completed: the file was created as part of planning.)

- [ ] **Step 1.2: Commit**

```bash
git add lib/db/README.md
git commit -m "docs(db): add database schema reference for BOH costing"
```

---

## Task 2: InventoryType Constraint + Yield Factor + Par Levels

This task tightens the category type to a proper union and adds three new optional columns to `inventory_items`: `yield_factor` (required, defaults to 1.0), `par_level`, `reorder_point`, and `reorder_qty`.

**Files:**
- Modify: `lib/types/src/inventory/index.ts`
- Modify: `lib/db/src/schema.ts`
- Modify: `lib/db/src/repositories/inventory.ts`
- Modify: `lib/db/src/__tests__/inventory.test.ts`

---

- [ ] **Step 2.1: Write failing tests for new item fields**

Open `lib/db/src/__tests__/inventory.test.ts` and replace the entire file contents:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb, type DbClient } from './helpers';
import { createInventoryRepo } from '../repositories/inventory';
import * as schema from '../schema';

let db: DbClient;
let repo: ReturnType<typeof createInventoryRepo>;

beforeEach(async () => {
  db = await createTestDb();
  repo = createInventoryRepo(db);
});

describe('createInventoryRepo', () => {
  describe('upsertCategory', () => {
    it('creates a new category', async () => {
      await repo.upsertCategory({ id: 'cat-1', name: 'Beverages', type: 'beverage' });
      const rows = await db.select().from(schema.inventoryCategories);
      expect(rows).toHaveLength(1);
      expect(rows[0]!.name).toBe('Beverages');
    });

    it('updates an existing category', async () => {
      await repo.upsertCategory({ id: 'cat-1', name: 'Beverages', type: 'beverage' });
      await repo.upsertCategory({ id: 'cat-1', name: 'Drinks', type: 'beverage' });
      const rows = await db.select().from(schema.inventoryCategories);
      expect(rows).toHaveLength(1);
      expect(rows[0]!.name).toBe('Drinks');
    });
  });

  describe('getCategories', () => {
    it('returns categories sorted by name', async () => {
      await repo.upsertCategory({ id: 'cat-2', name: 'Produce', type: 'food' });
      await repo.upsertCategory({ id: 'cat-1', name: 'Beverages', type: 'beverage' });
      const cats = await repo.getCategories();
      expect(cats.map((c) => c.name)).toEqual(['Beverages', 'Produce']);
    });

    it('returns empty array when no categories', async () => {
      expect(await repo.getCategories()).toEqual([]);
    });
  });

  describe('upsertItem', () => {
    beforeEach(() => repo.upsertCategory({ id: 'cat-1', name: 'Food', type: 'food' }));

    it('creates a new item with default yieldFactor of 1.0', async () => {
      await repo.upsertItem({
        id: 'item-1',
        name: 'Chips',
        categoryId: 'cat-1',
        type: 'food',
        unitOfMeasure: 'kg',
      });
      const rows = await db.select().from(schema.inventoryItems);
      expect(rows).toHaveLength(1);
      expect(rows[0]!.yieldFactor).toBe(1.0);
    });

    it('stores a custom yieldFactor', async () => {
      await repo.upsertItem({
        id: 'item-1',
        name: 'Whole Chicken',
        categoryId: 'cat-1',
        type: 'food',
        yieldFactor: 0.75,
      });
      const rows = await db.select().from(schema.inventoryItems);
      expect(rows[0]!.yieldFactor).toBe(0.75);
    });

    it('stores par level and reorder fields', async () => {
      await repo.upsertItem({
        id: 'item-1',
        name: 'Lager Keg',
        categoryId: 'cat-1',
        type: 'beverage',
        parLevel: 4,
        reorderPoint: 2,
        reorderQty: 4,
      });
      const rows = await db.select().from(schema.inventoryItems);
      expect(rows[0]!.parLevel).toBe(4);
      expect(rows[0]!.reorderPoint).toBe(2);
      expect(rows[0]!.reorderQty).toBe(4);
    });

    it('updates an existing item', async () => {
      await repo.upsertItem({ id: 'item-1', name: 'OJ', categoryId: 'cat-1', type: 'food' });
      await repo.upsertItem({ id: 'item-1', name: 'Apple Juice', categoryId: 'cat-1', type: 'food', yieldFactor: 0.9 });
      const rows = await db.select().from(schema.inventoryItems);
      expect(rows).toHaveLength(1);
      expect(rows[0]!.name).toBe('Apple Juice');
      expect(rows[0]!.yieldFactor).toBe(0.9);
    });
  });

  describe('getItems', () => {
    it('returns items with yieldFactor and par fields', async () => {
      await repo.upsertCategory({ id: 'cat-1', name: 'Food', type: 'food' });
      await repo.upsertItem({
        id: 'item-1',
        name: 'Chips',
        categoryId: 'cat-1',
        type: 'food',
        yieldFactor: 0.8,
        parLevel: 5,
      });
      const items = await repo.getItems();
      expect(items).toHaveLength(1);
      expect(items[0]!.yieldFactor).toBe(0.8);
      expect(items[0]!.parLevel).toBe(5);
    });
  });

  describe('deleteCategory', () => {
    it('removes a category', async () => {
      await repo.upsertCategory({ id: 'cat-1', name: 'Food', type: 'food' });
      await repo.deleteCategory('cat-1');
      expect(await db.select().from(schema.inventoryCategories)).toHaveLength(0);
    });
  });

  describe('deleteItem', () => {
    it('removes an item', async () => {
      await repo.upsertCategory({ id: 'cat-1', name: 'Food', type: 'food' });
      await repo.upsertItem({ id: 'item-1', name: 'Chips', categoryId: 'cat-1', type: 'food' });
      await repo.deleteItem('item-1');
      expect(await db.select().from(schema.inventoryItems)).toHaveLength(0);
    });
  });
});
```

- [ ] **Step 2.2: Run tests — expect failures**

```bash
pnpm --filter @reyogo/db run test
```

Expected: Several failures referencing unknown columns (`yieldFactor`, etc.) and type errors.

- [ ] **Step 2.3: Update the InventoryType and IInventoryItem types**

Replace the entire contents of `lib/types/src/inventory/index.ts`:

```typescript
export type InventoryType = 'food' | 'beverage' | 'non-food';

export interface IInventoryCategory {
  id: string;
  name: string;
  type: InventoryType;
}

export interface IInventoryItem {
  id: string;
  name: string;
  categoryId: string;
  type: InventoryType;
  unitOfMeasure?: string;
  yieldFactor: number;
  parLevel?: number | null;
  reorderPoint?: number | null;
  reorderQty?: number | null;
}

export interface IInventorySubmitPayload {
  addedCategories: IInventoryCategory[];
  addedItems: IInventoryItem[];
  updatedCategories: IInventoryCategory[];
  updatedItems: IInventoryItem[];
  deletedCategoryIds: string[];
  deletedItemIds: string[];
}
```

- [ ] **Step 2.4: Update the schema — add CHECK constraint and new columns**

Open `lib/db/src/schema.ts`. Update the import line at the top to add `check` and `sql`:

```typescript
import { check, index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import type { StockMovementType, ReferenceType } from '@reyogo/types';
```

Then find `inventoryCategories` and replace it to add the CHECK constraint:

```typescript
export const inventoryCategories = sqliteTable(
  'inventory_categories',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    type: text('type').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  },
  (t) => ({
    typeCheck: check(
      'inventory_categories_type_check',
      sql`${t.type} IN ('food', 'beverage', 'non-food')`,
    ),
  }),
);
```

Then find `inventoryItems` and replace it to add the new columns:

```typescript
export const inventoryItems = sqliteTable('inventory_items', {
  id: text('id').primaryKey(),
  accountId: text('account_id')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  categoryId: text('category_id')
    .notNull()
    .references(() => inventoryCategories.id, { onDelete: 'cascade' }),
  unitOfMeasure: text('unit_of_measure'),
  yieldFactor: real('yield_factor').notNull().default(1.0),
  parLevel: real('par_level'),
  reorderPoint: real('reorder_point'),
  reorderQty: real('reorder_qty'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});
```

- [ ] **Step 2.5: Generate the Drizzle migration**

```bash
pnpm --filter @reyogo/db run db:generate
```

Expected: A new SQL file appears in `lib/db/migrations/` that ALTERs `inventory_items` to add the four new columns and adds a CHECK constraint to `inventory_categories`. Confirm the file exists before continuing.

- [ ] **Step 2.6: Update the inventory repository**

Replace the entire contents of `lib/db/src/repositories/inventory.ts`:

```typescript
import { asc, eq } from 'drizzle-orm';
import type { IInventoryCategory, IInventoryItem } from '@reyogo/types';
import type { DbClient } from '../client';
import * as schema from '../schema';
import type { InventoryCategoryRow, InventoryItemRow } from '../schema';
import { now } from '../utils/timestamps';

function toCategory(row: InventoryCategoryRow): IInventoryCategory {
  return { id: row.id, name: row.name, type: row.type as IInventoryCategory['type'] };
}

function toItem(row: InventoryItemRow, type: IInventoryCategory['type']): IInventoryItem {
  return {
    id: row.id,
    name: row.name,
    categoryId: row.categoryId,
    type,
    unitOfMeasure: (row.unitOfMeasure as IInventoryItem['unitOfMeasure']) ?? undefined,
    yieldFactor: row.yieldFactor,
    parLevel: row.parLevel ?? null,
    reorderPoint: row.reorderPoint ?? null,
    reorderQty: row.reorderQty ?? null,
  };
}

export function createInventoryRepo(db: DbClient) {
  return {
    async getCategories(): Promise<IInventoryCategory[]> {
      const rows = await db
        .select()
        .from(schema.inventoryCategories)
        .orderBy(schema.inventoryCategories.name);
      return rows.map(toCategory);
    },

    async getItems(): Promise<IInventoryItem[]> {
      const rows = await db
        .select({ item: schema.inventoryItems, categoryType: schema.inventoryCategories.type })
        .from(schema.inventoryItems)
        .innerJoin(
          schema.inventoryCategories,
          eq(schema.inventoryItems.categoryId, schema.inventoryCategories.id),
        )
        .orderBy(asc(schema.inventoryItems.name));
      return rows.map((r) => toItem(r.item, r.categoryType as IInventoryCategory['type']));
    },

    async upsertCategory(category: IInventoryCategory): Promise<void> {
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

    async upsertItem(item: IInventoryItem): Promise<void> {
      const ts = now();
      await db
        .insert(schema.inventoryItems)
        .values({
          id: item.id,
          accountId: 'default',
          name: item.name,
          categoryId: item.categoryId,
          unitOfMeasure: item.unitOfMeasure ?? null,
          yieldFactor: item.yieldFactor ?? 1.0,
          parLevel: item.parLevel ?? null,
          reorderPoint: item.reorderPoint ?? null,
          reorderQty: item.reorderQty ?? null,
          createdAt: ts,
          updatedAt: ts,
        })
        .onConflictDoUpdate({
          target: schema.inventoryItems.id,
          set: {
            name: item.name,
            categoryId: item.categoryId,
            unitOfMeasure: item.unitOfMeasure ?? null,
            yieldFactor: item.yieldFactor ?? 1.0,
            parLevel: item.parLevel ?? null,
            reorderPoint: item.reorderPoint ?? null,
            reorderQty: item.reorderQty ?? null,
            updatedAt: ts,
          },
        });
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

- [ ] **Step 2.7: Run tests — expect pass**

```bash
pnpm --filter @reyogo/db run test
```

Expected: All tests pass. If any test in `stockMovements.test.ts` fails because it seeds `type: 'ingredient'`, update the seeded category type to `'food'` in that file's `seedItem` helper.

- [ ] **Step 2.8: Typecheck**

```bash
pnpm --filter @reyogo/db run typecheck
```

Expected: No errors.

- [ ] **Step 2.9: Commit**

```bash
git add lib/types/src/inventory/index.ts \
        lib/db/src/schema.ts \
        lib/db/src/repositories/inventory.ts \
        lib/db/src/__tests__/inventory.test.ts \
        lib/db/migrations/
git commit -m "feat(db): add InventoryType CHECK constraint, yield factor, and par level fields"
```

---

## Task 3: Physical Stocktake System

Adds two new tables (`stock_count_sessions`, `stock_count_lines`) plus a repository with `completeSession` logic that calculates variances and creates `ADJUSTMENT` stock movements automatically.

**Files:**
- Create: `lib/types/src/stockCounts/index.ts`
- Modify: `lib/types/src/index.ts`
- Modify: `lib/db/src/schema.ts`
- Create: `lib/db/src/repositories/stockCounts.ts`
- Modify: `lib/db/src/index.ts`
- Create: `lib/db/src/__tests__/stockCounts.test.ts`

---

- [ ] **Step 3.1: Write failing tests**

Create `lib/db/src/__tests__/stockCounts.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { eq } from 'drizzle-orm';
import { createTestDb, type DbClient } from './helpers';
import { createStockCountsRepo } from '../repositories/stockCounts';
import * as schema from '../schema';

let db: DbClient;
let repo: ReturnType<typeof createStockCountsRepo>;

async function seedItem(db: DbClient, itemId: string) {
  await db.insert(schema.inventoryCategories).values({
    id: 'cat-1',
    accountId: 'default',
    name: 'Food',
    type: 'food',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  await db.insert(schema.inventoryItems).values({
    id: itemId,
    accountId: 'default',
    name: 'Test Item',
    categoryId: 'cat-1',
    yieldFactor: 1.0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

async function seedMovement(db: DbClient, itemId: string, qty: number, wac: number) {
  const t = new Date('2024-01-01T10:00:00Z');
  await db.insert(schema.stockMovements).values({
    id: `mv-${itemId}-${Date.now()}`,
    accountId: 'default',
    inventoryItemId: itemId,
    movementType: 'IN',
    qty,
    unitCostAtTime: wac,
    weightedAvgCostAfter: wac,
    stockQtyAfter: qty,
    occurredAt: t,
    createdAt: t,
  });
}

beforeEach(async () => {
  db = await createTestDb();
  repo = createStockCountsRepo(db);
});

describe('createStockCountsRepo', () => {
  describe('createSession', () => {
    it('creates a draft session', async () => {
      await repo.createSession({
        id: 'sess-1',
        periodStart: new Date('2024-01-01'),
        periodEnd: new Date('2024-01-07'),
      });
      const rows = await db.select().from(schema.stockCountSessions);
      expect(rows).toHaveLength(1);
      expect(rows[0]!.status).toBe('draft');
    });

    it('stores optional notes', async () => {
      await repo.createSession({
        id: 'sess-1',
        periodStart: new Date('2024-01-01'),
        periodEnd: new Date('2024-01-07'),
        notes: 'Weekly spirits count',
      });
      const rows = await db.select().from(schema.stockCountSessions);
      expect(rows[0]!.notes).toBe('Weekly spirits count');
    });
  });

  describe('getSessions', () => {
    it('returns sessions ordered by periodEnd descending', async () => {
      await repo.createSession({ id: 'sess-1', periodStart: new Date('2024-01-01'), periodEnd: new Date('2024-01-07') });
      await repo.createSession({ id: 'sess-2', periodStart: new Date('2024-01-08'), periodEnd: new Date('2024-01-14') });
      const sessions = await repo.getSessions();
      expect(sessions[0]!.id).toBe('sess-2');
      expect(sessions[1]!.id).toBe('sess-1');
    });

    it('returns empty array when none exist', async () => {
      expect(await repo.getSessions()).toEqual([]);
    });
  });

  describe('getSession', () => {
    it('returns null for unknown id', async () => {
      expect(await repo.getSession('nope')).toBeNull();
    });

    it('returns session with its lines', async () => {
      await seedItem(db, 'item-1');
      await repo.createSession({ id: 'sess-1', periodStart: new Date('2024-01-01'), periodEnd: new Date('2024-01-07') });
      await repo.upsertLine({ id: 'line-1', sessionId: 'sess-1', inventoryItemId: 'item-1', countedQty: 5 });
      const session = await repo.getSession('sess-1');
      expect(session).not.toBeNull();
      expect(session!.lines).toHaveLength(1);
      expect(session!.lines[0]!.countedQty).toBe(5);
    });
  });

  describe('upsertLine', () => {
    beforeEach(async () => {
      await seedItem(db, 'item-1');
      await repo.createSession({ id: 'sess-1', periodStart: new Date('2024-01-01'), periodEnd: new Date('2024-01-07') });
    });

    it('records a counted quantity', async () => {
      await repo.upsertLine({ id: 'line-1', sessionId: 'sess-1', inventoryItemId: 'item-1', countedQty: 7 });
      const rows = await db.select().from(schema.stockCountLines);
      expect(rows[0]!.countedQty).toBe(7);
    });

    it('overwrites countedQty on re-count of same line', async () => {
      await repo.upsertLine({ id: 'line-1', sessionId: 'sess-1', inventoryItemId: 'item-1', countedQty: 5 });
      await repo.upsertLine({ id: 'line-1', sessionId: 'sess-1', inventoryItemId: 'item-1', countedQty: 8 });
      const rows = await db.select().from(schema.stockCountLines);
      expect(rows).toHaveLength(1);
      expect(rows[0]!.countedQty).toBe(8);
    });
  });

  describe('completeSession', () => {
    it('marks session as complete', async () => {
      await repo.createSession({ id: 'sess-1', periodStart: new Date('2024-01-01'), periodEnd: new Date('2024-01-07') });
      await repo.completeSession('sess-1');
      const session = await repo.getSession('sess-1');
      expect(session!.status).toBe('complete');
    });

    it('writes bookQty and variance on each line', async () => {
      await seedItem(db, 'item-1');
      await seedMovement(db, 'item-1', 10, 5.0);
      await repo.createSession({ id: 'sess-1', periodStart: new Date('2024-01-01'), periodEnd: new Date('2024-01-07') });
      await repo.upsertLine({ id: 'line-1', sessionId: 'sess-1', inventoryItemId: 'item-1', countedQty: 8 });
      await repo.completeSession('sess-1');
      const session = await repo.getSession('sess-1');
      expect(session!.lines[0]!.bookQty).toBe(10);
      expect(session!.lines[0]!.variance).toBe(-2);
    });

    it('creates an ADJUSTMENT movement when count differs from book', async () => {
      await seedItem(db, 'item-1');
      await seedMovement(db, 'item-1', 10, 5.0);
      await repo.createSession({ id: 'sess-1', periodStart: new Date('2024-01-01'), periodEnd: new Date('2024-01-07') });
      await repo.upsertLine({ id: 'line-1', sessionId: 'sess-1', inventoryItemId: 'item-1', countedQty: 8 });
      await repo.completeSession('sess-1');
      const adjustments = await db
        .select()
        .from(schema.stockMovements)
        .where(eq(schema.stockMovements.movementType, 'ADJUSTMENT'));
      expect(adjustments).toHaveLength(1);
      expect(adjustments[0]!.qty).toBe(-2);
      expect(adjustments[0]!.stockQtyAfter).toBe(8);
      expect(adjustments[0]!.referenceType).toBe('adjustment');
      expect(adjustments[0]!.referenceId).toBe('sess-1');
    });

    it('creates no adjustment when count matches book', async () => {
      await seedItem(db, 'item-1');
      await seedMovement(db, 'item-1', 10, 5.0);
      await repo.createSession({ id: 'sess-1', periodStart: new Date('2024-01-01'), periodEnd: new Date('2024-01-07') });
      await repo.upsertLine({ id: 'line-1', sessionId: 'sess-1', inventoryItemId: 'item-1', countedQty: 10 });
      await repo.completeSession('sess-1');
      const adjustments = await db
        .select()
        .from(schema.stockMovements)
        .where(eq(schema.stockMovements.movementType, 'ADJUSTMENT'));
      expect(adjustments).toHaveLength(0);
    });

    it('treats no prior movements as book qty of 0', async () => {
      await seedItem(db, 'item-1');
      await repo.createSession({ id: 'sess-1', periodStart: new Date('2024-01-01'), periodEnd: new Date('2024-01-07') });
      await repo.upsertLine({ id: 'line-1', sessionId: 'sess-1', inventoryItemId: 'item-1', countedQty: 3 });
      await repo.completeSession('sess-1');
      const session = await repo.getSession('sess-1');
      expect(session!.lines[0]!.bookQty).toBe(0);
      expect(session!.lines[0]!.variance).toBe(3);
      const adjustments = await db
        .select()
        .from(schema.stockMovements)
        .where(eq(schema.stockMovements.movementType, 'ADJUSTMENT'));
      expect(adjustments[0]!.qty).toBe(3);
      expect(adjustments[0]!.stockQtyAfter).toBe(3);
    });

    it('throws when session not found', async () => {
      await expect(repo.completeSession('nope')).rejects.toThrow('not found');
    });

    it('throws when session already complete', async () => {
      await repo.createSession({ id: 'sess-1', periodStart: new Date('2024-01-01'), periodEnd: new Date('2024-01-07') });
      await repo.completeSession('sess-1');
      await expect(repo.completeSession('sess-1')).rejects.toThrow('already complete');
    });
  });
});
```

- [ ] **Step 3.2: Run tests — expect failures**

```bash
pnpm --filter @reyogo/db run test
```

Expected: Failures because `stockCounts` repository and schema tables don't exist yet.

- [ ] **Step 3.3: Create the stockCounts types**

Create `lib/types/src/stockCounts/index.ts`:

```typescript
export type StockCountStatus = 'draft' | 'complete';

export interface IStockCountLine {
  id: string;
  sessionId: string;
  inventoryItemId: string;
  countedQty: number;
  bookQty: number | null;
  variance: number | null;
  notes: string | null;
}

export interface IStockCountSession {
  id: string;
  periodStart: Date;
  periodEnd: Date;
  status: StockCountStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStockCountSessionWithLines extends IStockCountSession {
  lines: IStockCountLine[];
}

export interface ICreateStockCountSessionPayload {
  id: string;
  periodStart: Date;
  periodEnd: Date;
  notes?: string | null;
}

export interface IUpsertStockCountLinePayload {
  id: string;
  sessionId: string;
  inventoryItemId: string;
  countedQty: number;
  notes?: string | null;
}
```

- [ ] **Step 3.4: Export the new types from the types package**

Open `lib/types/src/index.ts` and add one line:

```typescript
export * from './base';
export * from './inventory';
export * from './invoices';
export * from './setup';
export * from './stockCounts';
export * from './stockMovements';
export * from './suppliers';
```

- [ ] **Step 3.5: Add the two new tables to the schema**

Open `lib/db/src/schema.ts`. At the end of the file, after the `costingSnapshots` table, add:

```typescript
export const stockCountSessions = sqliteTable('stock_count_sessions', {
  id: text('id').primaryKey(),
  accountId: text('account_id')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  periodStart: integer('period_start', { mode: 'timestamp' }).notNull(),
  periodEnd: integer('period_end', { mode: 'timestamp' }).notNull(),
  status: text('status').notNull().default('draft'),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});
export type StockCountSessionRow = typeof stockCountSessions.$inferSelect;
export type NewStockCountSessionRow = typeof stockCountSessions.$inferInsert;

export const stockCountLines = sqliteTable(
  'stock_count_lines',
  {
    id: text('id').primaryKey(),
    sessionId: text('session_id')
      .notNull()
      .references(() => stockCountSessions.id, { onDelete: 'cascade' }),
    inventoryItemId: text('inventory_item_id')
      .notNull()
      .references(() => inventoryItems.id, { onDelete: 'restrict' }),
    countedQty: real('counted_qty').notNull(),
    bookQty: real('book_qty'),
    variance: real('variance'),
    notes: text('notes'),
  },
  (t) => ({
    countLinesBySession: index('count_lines_session_idx').on(t.sessionId),
  }),
);
export type StockCountLineRow = typeof stockCountLines.$inferSelect;
export type NewStockCountLineRow = typeof stockCountLines.$inferInsert;
```

- [ ] **Step 3.6: Generate the migration**

```bash
pnpm --filter @reyogo/db run db:generate
```

Expected: A new SQL file appears in `lib/db/migrations/` that creates `stock_count_sessions` and `stock_count_lines`. Verify before continuing.

- [ ] **Step 3.7: Create the stockCounts repository**

Create `lib/db/src/repositories/stockCounts.ts`:

```typescript
import { desc, eq } from 'drizzle-orm';
import type {
  IStockCountSession,
  IStockCountSessionWithLines,
  IStockCountLine,
  ICreateStockCountSessionPayload,
  IUpsertStockCountLinePayload,
} from '@reyogo/types';
import type { DbClient } from '../client';
import * as schema from '../schema';
import type { StockCountSessionRow, StockCountLineRow } from '../schema';
import { now } from '../utils/timestamps';
import { generateId } from '../utils/ids';

type TxClient = Parameters<DbClient['transaction']>[0] extends (tx: infer T) => Promise<unknown>
  ? T
  : never;

function toSession(row: StockCountSessionRow): IStockCountSession {
  return {
    id: row.id,
    periodStart: row.periodStart,
    periodEnd: row.periodEnd,
    status: row.status as IStockCountSession['status'],
    notes: row.notes ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toLine(row: StockCountLineRow): IStockCountLine {
  return {
    id: row.id,
    sessionId: row.sessionId,
    inventoryItemId: row.inventoryItemId,
    countedQty: row.countedQty,
    bookQty: row.bookQty ?? null,
    variance: row.variance ?? null,
    notes: row.notes ?? null,
  };
}

async function getLatestMovement(tx: TxClient, itemId: string) {
  const rows = await tx
    .select({
      stockQtyAfter: schema.stockMovements.stockQtyAfter,
      weightedAvgCostAfter: schema.stockMovements.weightedAvgCostAfter,
    })
    .from(schema.stockMovements)
    .where(eq(schema.stockMovements.inventoryItemId, itemId))
    .orderBy(desc(schema.stockMovements.occurredAt), desc(schema.stockMovements.createdAt))
    .limit(1);
  return rows[0] ?? null;
}

export function createStockCountsRepo(db: DbClient) {
  return {
    async createSession(payload: ICreateStockCountSessionPayload): Promise<void> {
      const ts = now();
      await db.insert(schema.stockCountSessions).values({
        id: payload.id,
        accountId: 'default',
        periodStart: payload.periodStart,
        periodEnd: payload.periodEnd,
        status: 'draft',
        notes: payload.notes ?? null,
        createdAt: ts,
        updatedAt: ts,
      });
    },

    async getSessions(): Promise<IStockCountSession[]> {
      const rows = await db
        .select()
        .from(schema.stockCountSessions)
        .orderBy(desc(schema.stockCountSessions.periodEnd));
      return rows.map(toSession);
    },

    async getSession(id: string): Promise<IStockCountSessionWithLines | null> {
      const sessionRows = await db
        .select()
        .from(schema.stockCountSessions)
        .where(eq(schema.stockCountSessions.id, id))
        .limit(1);
      if (!sessionRows[0]) return null;
      const lineRows = await db
        .select()
        .from(schema.stockCountLines)
        .where(eq(schema.stockCountLines.sessionId, id));
      return { ...toSession(sessionRows[0]), lines: lineRows.map(toLine) };
    },

    async upsertLine(payload: IUpsertStockCountLinePayload): Promise<void> {
      await db
        .insert(schema.stockCountLines)
        .values({
          id: payload.id,
          sessionId: payload.sessionId,
          inventoryItemId: payload.inventoryItemId,
          countedQty: payload.countedQty,
          notes: payload.notes ?? null,
        })
        .onConflictDoUpdate({
          target: schema.stockCountLines.id,
          set: {
            countedQty: payload.countedQty,
            notes: payload.notes ?? null,
          },
        });
    },

    async completeSession(id: string): Promise<void> {
      const session = await this.getSession(id);
      if (!session) throw new Error(`Stock count session not found: ${id}`);
      if (session.status === 'complete') throw new Error(`Session already complete: ${id}`);
      const completedAt = now();
      await db.transaction(async (tx) => {
        for (const line of session.lines) {
          const prev = await getLatestMovement(tx, line.inventoryItemId);
          const bookQty = prev?.stockQtyAfter ?? 0;
          const variance = line.countedQty - bookQty;
          await tx
            .update(schema.stockCountLines)
            .set({ bookQty, variance })
            .where(eq(schema.stockCountLines.id, line.id));
          if (variance !== 0) {
            const currentWac = prev?.weightedAvgCostAfter ?? null;
            const newQty = bookQty + variance;
            await tx.insert(schema.stockMovements).values({
              id: generateId(),
              accountId: 'default',
              inventoryItemId: line.inventoryItemId,
              movementType: 'ADJUSTMENT',
              qty: variance,
              unitCostAtTime: currentWac,
              totalCost: variance * (currentWac ?? 0),
              weightedAvgCostAfter: currentWac,
              stockQtyAfter: newQty,
              referenceType: 'adjustment',
              referenceId: id,
              notes: 'Stock count adjustment',
              occurredAt: completedAt,
              createdAt: completedAt,
            });
          }
        }
        await tx
          .update(schema.stockCountSessions)
          .set({ status: 'complete', updatedAt: completedAt })
          .where(eq(schema.stockCountSessions.id, id));
      });
    },
  };
}
```

- [ ] **Step 3.8: Export the new repository from the db package**

Open `lib/db/src/index.ts` and add one line:

```typescript
export * from './client';
export * as schema from './schema';
export * from './schema';
export * from './utils/wac';
export * from './utils/timestamps';
export * from './utils/ids';
export * from './repositories/inventory';
export * from './repositories/suppliers';
export * from './repositories/stockCounts';
export * from './repositories/stockMovements';
export * from './repositories/invoices';
export * from './repositories/setup';
```

- [ ] **Step 3.9: Run tests — expect pass**

```bash
pnpm --filter @reyogo/db run test
```

Expected: All tests pass, including the new `stockCounts.test.ts`.

- [ ] **Step 3.10: Typecheck**

```bash
pnpm --filter @reyogo/db run typecheck
pnpm --filter @reyogo/types run typecheck
```

Expected: No errors on either package.

- [ ] **Step 3.11: Run full monorepo test suite**

```bash
pnpm run test
```

Expected: All packages pass. If the desktop app's renderer tests reference `InventoryType` with values like `'ingredient'` or `'finished_good'`, update them to use `'food'`, `'beverage'`, or `'non-food'`.

- [ ] **Step 3.12: Commit**

```bash
git add lib/types/src/stockCounts/ \
        lib/types/src/index.ts \
        lib/db/src/schema.ts \
        lib/db/src/repositories/stockCounts.ts \
        lib/db/src/index.ts \
        lib/db/src/__tests__/stockCounts.test.ts \
        lib/db/migrations/
git commit -m "feat(db): add physical stocktake system with sessions, count lines, and adjustment movements"
```

---

## Self-Review

**Spec coverage check:**

| Requirement | Covered by |
|---|---|
| InventoryType constrained to food/beverage/non-food | Task 2, Step 2.3 + CHECK constraint Step 2.4 |
| Yield factor on inventory items | Task 2, Steps 2.4–2.6 |
| Par level / reorder fields on items | Task 2, Steps 2.4–2.6 |
| Stock count sessions table | Task 3, Step 3.5 |
| Stock count lines table | Task 3, Step 3.5 |
| Variance calculation on session completion | Task 3, Step 3.7 (`completeSession`) |
| ADJUSTMENT movement created on variance | Task 3, Step 3.7 + 3.1 tests |
| No movement created when count matches book | Task 3, Step 3.1 test |

**Notes:**
- `yieldFactor` defaults to `1.0` at the schema level so existing rows are unaffected.
- WAC is preserved (not recalculated) for ADJUSTMENT movements — standard BOH accounting practice, avoids distorting the cost of goods already sold.
- `completeSession` with zero lines is valid (marks complete immediately) — useful for a period where nothing was counted.
