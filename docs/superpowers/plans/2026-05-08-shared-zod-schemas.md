# Shared Zod Schemas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Zod validation schemas for every entity in `packages/shared`, giving Lambda handlers and the React web app a single browser-safe source of truth for input validation.

**Architecture:** Schemas live in `packages/shared/src/schemas/`, one file per domain (inventory, invoices, setup, stockMovements). Each file exports Zod schemas and `z.infer`-derived types. The existing `I*` interfaces in `src/inventory/`, `src/invoices/`, etc. are left untouched — they serve the desktop's SQLite layer where `Date` is a real `Date` object. Schema-derived types represent the HTTP wire format (ISO date strings). A barrel at `src/schemas/index.ts` re-exports everything, and the root `src/index.ts` adds `export * from './schemas'`.

**Tech Stack:** Zod 3, Vitest, TypeScript 5, pnpm workspaces

---

## File Map

### New files

| Path | Purpose |
|------|---------|
| `packages/shared/vitest.config.ts` | Vitest config (no jsdom needed — pure logic) |
| `packages/shared/src/schemas/inventory.ts` | Zod schemas for `InventoryCategory`, `InventoryItem`, `InventorySubmitPayload` |
| `packages/shared/src/schemas/invoices.ts` | Zod schemas for `VatMode`, `InvoiceLine`, `CapturedInvoice`, `SaveCapturedInvoicePayload`, `UpdateCapturedInvoicePayload` |
| `packages/shared/src/schemas/setup.ts` | Zod schemas for `UnitOfMeasure` |
| `packages/shared/src/schemas/stockMovements.ts` | Zod schemas for `StockMovement` |
| `packages/shared/src/schemas/index.ts` | Barrel re-export |
| `packages/shared/src/schemas/inventory.test.ts` | Vitest tests for inventory schemas |
| `packages/shared/src/schemas/invoices.test.ts` | Vitest tests for invoices schemas |
| `packages/shared/src/schemas/setup.test.ts` | Vitest tests for setup schemas |
| `packages/shared/src/schemas/stockMovements.test.ts` | Vitest tests for stockMovements schemas |

### Modified files

| Path | Change |
|------|--------|
| `packages/shared/package.json` | Add `zod` dep, `vitest` devDep, `test` script, `./schemas` export |
| `packages/shared/tsconfig.json` | Widen `include` to cover `vitest.config.ts` |
| `packages/shared/src/index.ts` | Add `export * from './schemas'` |

---

## Task 1: Create the feature branch

**Files:** none (git operations only)

> Run these from the monorepo root. This branch is based on `main` after `feat/scaffold-packages-web` merges. If that PR hasn't merged yet, base off it with `git checkout feat/scaffold-packages-web` first.

- [ ] **Step 1: Pull latest main**

```bash
cd /Users/shane/Dev/ReYoGo
git checkout main && git pull origin main
```

- [ ] **Step 2: Create worktree**

```bash
git worktree add .claude/worktrees/feat+shared-zod-schemas -b feat/shared-zod-schemas
```

Expected: `Preparing worktree (new branch 'feat/shared-zod-schemas')`.

All remaining steps run from:
```bash
cd /Users/shane/Dev/ReYoGo/.claude/worktrees/feat+shared-zod-schemas
```

---

## Task 2: Wire Zod and Vitest into packages/shared

**Files:**
- Modify: `packages/shared/package.json`
- Create: `packages/shared/vitest.config.ts`
- Modify: `packages/shared/tsconfig.json` (if it exists; create if not)

- [ ] **Step 1: Update `packages/shared/package.json`**

Replace the current content entirely:

```json
{
  "name": "@reyogo/shared",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./inventory": "./src/inventory/index.ts",
    "./invoices": "./src/invoices/index.ts",
    "./setup": "./src/setup/index.ts",
    "./stockMovements": "./src/stockMovements/index.ts",
    "./schemas": "./src/schemas/index.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "lint": "oxlint --config ../../packages/config/oxlint.json src/",
    "format": "oxfmt src/",
    "format:check": "oxfmt --check src/"
  },
  "dependencies": {
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "oxlint": "^1.61.0",
    "typescript": "^5.3.3",
    "vitest": "^1.2.0"
  }
}
```

- [ ] **Step 2: Create `packages/shared/vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
  },
});
```

- [ ] **Step 3: Check whether `packages/shared/tsconfig.json` exists**

```bash
cat packages/shared/tsconfig.json 2>/dev/null || echo "MISSING"
```

If it says MISSING, create it:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "lib": ["ES2022"]
  },
  "include": ["src", "vitest.config.ts"]
}
```

If it exists, add `"vitest.config.ts"` to its `include` array if it isn't already there.

- [ ] **Step 4: Install deps**

```bash
pnpm install
```

Expected: `zod` and `vitest` appear in the lockfile under `@reyogo/shared`.

- [ ] **Step 5: Confirm vitest can find the package**

```bash
pnpm --filter @reyogo/shared run test
```

Expected: `No test files found` — that's fine, tests don't exist yet.

---

## Task 3: Inventory schemas — TDD

**Files:**
- Create: `packages/shared/src/schemas/inventory.test.ts`
- Create: `packages/shared/src/schemas/inventory.ts`

- [ ] **Step 1: Create the failing test file**

```ts
import { describe, expect, it } from 'vitest';
import {
  InventoryCategorySchema,
  InventoryItemSchema,
  InventorySubmitPayloadSchema,
  CreateInventoryCategorySchema,
  CreateInventoryItemSchema,
} from './inventory';

describe('InventoryCategorySchema', () => {
  it('accepts a valid category', () => {
    const result = InventoryCategorySchema.parse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Beverages',
      type: 'consumable',
    });
    expect(result.id).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  it('rejects a missing name', () => {
    expect(() =>
      InventoryCategorySchema.parse({ id: '550e8400-e29b-41d4-a716-446655440000', type: 'consumable' }),
    ).toThrow();
  });

  it('rejects an empty name', () => {
    expect(() =>
      InventoryCategorySchema.parse({ id: '550e8400-e29b-41d4-a716-446655440000', name: '', type: 'consumable' }),
    ).toThrow();
  });

  it('rejects a non-UUID id', () => {
    expect(() =>
      InventoryCategorySchema.parse({ id: 'not-a-uuid', name: 'Beverages', type: 'consumable' }),
    ).toThrow();
  });
});

describe('CreateInventoryCategorySchema', () => {
  it('accepts a valid create payload without id', () => {
    const result = CreateInventoryCategorySchema.parse({ name: 'Beverages', type: 'consumable' });
    expect(result.name).toBe('Beverages');
  });
});

describe('InventoryItemSchema', () => {
  it('accepts a valid item', () => {
    const result = InventoryItemSchema.parse({
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Full Cream Milk',
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
      type: 'consumable',
    });
    expect(result.name).toBe('Full Cream Milk');
  });

  it('accepts an optional unitOfMeasure', () => {
    const result = InventoryItemSchema.parse({
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Full Cream Milk',
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
      type: 'consumable',
      unitOfMeasure: 'L',
    });
    expect(result.unitOfMeasure).toBe('L');
  });

  it('rejects a non-UUID categoryId', () => {
    expect(() =>
      InventoryItemSchema.parse({
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Full Cream Milk',
        categoryId: 'bad',
        type: 'consumable',
      }),
    ).toThrow();
  });
});

describe('CreateInventoryItemSchema', () => {
  it('accepts a valid create payload without id', () => {
    const result = CreateInventoryItemSchema.parse({
      name: 'Full Cream Milk',
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
      type: 'consumable',
    });
    expect(result.name).toBe('Full Cream Milk');
  });
});

describe('InventorySubmitPayloadSchema', () => {
  it('accepts an empty submit payload', () => {
    const result = InventorySubmitPayloadSchema.parse({
      addedCategories: [],
      addedItems: [],
      updatedCategories: [],
      updatedItems: [],
      deletedCategoryIds: [],
      deletedItemIds: [],
    });
    expect(result.addedCategories).toHaveLength(0);
  });

  it('rejects a deletedCategoryId that is not a UUID', () => {
    expect(() =>
      InventorySubmitPayloadSchema.parse({
        addedCategories: [],
        addedItems: [],
        updatedCategories: [],
        updatedItems: [],
        deletedCategoryIds: ['not-a-uuid'],
        deletedItemIds: [],
      }),
    ).toThrow();
  });
});
```

- [ ] **Step 2: Run test — confirm it fails on missing module**

```bash
pnpm --filter @reyogo/shared run test
```

Expected: fails with `Cannot find module './inventory'`.

- [ ] **Step 3: Create `packages/shared/src/schemas/inventory.ts`**

```ts
import { z } from 'zod';

export const InventoryCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  type: z.string().min(1),
});

export const CreateInventoryCategorySchema = InventoryCategorySchema.omit({ id: true });

export const InventoryItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  categoryId: z.string().uuid(),
  type: z.string().min(1),
  unitOfMeasure: z.string().optional(),
});

export const CreateInventoryItemSchema = InventoryItemSchema.omit({ id: true });

export const InventorySubmitPayloadSchema = z.object({
  addedCategories: z.array(CreateInventoryCategorySchema),
  addedItems: z.array(CreateInventoryItemSchema),
  updatedCategories: z.array(InventoryCategorySchema),
  updatedItems: z.array(InventoryItemSchema),
  deletedCategoryIds: z.array(z.string().uuid()),
  deletedItemIds: z.array(z.string().uuid()),
});

export type InventoryCategory = z.infer<typeof InventoryCategorySchema>;
export type CreateInventoryCategory = z.infer<typeof CreateInventoryCategorySchema>;
export type InventoryItem = z.infer<typeof InventoryItemSchema>;
export type CreateInventoryItem = z.infer<typeof CreateInventoryItemSchema>;
export type InventorySubmitPayload = z.infer<typeof InventorySubmitPayloadSchema>;
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
pnpm --filter @reyogo/shared run test -- --reporter=verbose
```

Expected: all 8 inventory tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/shared/
git commit -m "feat(shared): add Zod schemas for inventory entities

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 4: Invoices schemas — TDD

**Files:**
- Create: `packages/shared/src/schemas/invoices.test.ts`
- Create: `packages/shared/src/schemas/invoices.ts`

- [ ] **Step 1: Create the failing test file**

```ts
import { describe, expect, it } from 'vitest';
import {
  VatModeSchema,
  InvoiceLineInputSchema,
  CapturedInvoiceSchema,
  SaveCapturedInvoicePayloadSchema,
  UpdateCapturedInvoicePayloadSchema,
} from './invoices';

const LINE_ID = '550e8400-e29b-41d4-a716-446655440010';
const INVOICE_ID = '550e8400-e29b-41d4-a716-446655440020';
const ITEM_ID = '550e8400-e29b-41d4-a716-446655440030';

describe('VatModeSchema', () => {
  it('accepts valid vat modes', () => {
    expect(VatModeSchema.parse('inclusive')).toBe('inclusive');
    expect(VatModeSchema.parse('exclusive')).toBe('exclusive');
    expect(VatModeSchema.parse('non-taxable')).toBe('non-taxable');
  });

  it('rejects an unknown vat mode', () => {
    expect(() => VatModeSchema.parse('exempt')).toThrow();
  });
});

describe('InvoiceLineInputSchema', () => {
  it('accepts a valid invoice line', () => {
    const result = InvoiceLineInputSchema.parse({
      id: LINE_ID,
      itemId: ITEM_ID,
      itemNameSnapshot: 'Full Cream Milk',
      quantity: 10,
      vatMode: 'inclusive',
      vatRate: 0.15,
      totalVatExclude: 86.96,
    });
    expect(result.quantity).toBe(10);
  });

  it('rejects a zero quantity', () => {
    expect(() =>
      InvoiceLineInputSchema.parse({
        id: LINE_ID,
        itemId: ITEM_ID,
        itemNameSnapshot: 'Full Cream Milk',
        quantity: 0,
        vatMode: 'inclusive',
        vatRate: 0.15,
        totalVatExclude: 0,
      }),
    ).toThrow();
  });

  it('rejects a vatRate above 1', () => {
    expect(() =>
      InvoiceLineInputSchema.parse({
        id: LINE_ID,
        itemId: ITEM_ID,
        itemNameSnapshot: 'Full Cream Milk',
        quantity: 1,
        vatMode: 'inclusive',
        vatRate: 15,
        totalVatExclude: 1,
      }),
    ).toThrow();
  });

  it('rejects a negative totalVatExclude', () => {
    expect(() =>
      InvoiceLineInputSchema.parse({
        id: LINE_ID,
        itemId: ITEM_ID,
        itemNameSnapshot: 'Full Cream Milk',
        quantity: 1,
        vatMode: 'inclusive',
        vatRate: 0.15,
        totalVatExclude: -1,
      }),
    ).toThrow();
  });
});

describe('CapturedInvoiceSchema', () => {
  it('accepts a valid invoice with optional nulls', () => {
    const result = CapturedInvoiceSchema.parse({
      id: INVOICE_ID,
      invoiceNumber: null,
      invoiceDate: null,
      createdAt: '2026-05-08T10:00:00.000Z',
      updatedAt: null,
    });
    expect(result.id).toBe(INVOICE_ID);
  });

  it('rejects a non-ISO createdAt', () => {
    expect(() =>
      CapturedInvoiceSchema.parse({
        id: INVOICE_ID,
        createdAt: '8 May 2026',
      }),
    ).toThrow();
  });
});

describe('SaveCapturedInvoicePayloadSchema', () => {
  it('accepts a valid save payload', () => {
    const result = SaveCapturedInvoicePayloadSchema.parse({
      id: INVOICE_ID,
      lines: [
        {
          id: LINE_ID,
          itemId: ITEM_ID,
          itemNameSnapshot: 'Full Cream Milk',
          quantity: 2,
          vatMode: 'exclusive',
          vatRate: 0.15,
          totalVatExclude: 20,
        },
      ],
    });
    expect(result.lines).toHaveLength(1);
  });

  it('accepts an empty lines array', () => {
    const result = SaveCapturedInvoicePayloadSchema.parse({ id: INVOICE_ID, lines: [] });
    expect(result.lines).toHaveLength(0);
  });
});

describe('UpdateCapturedInvoicePayloadSchema', () => {
  it('accepts a valid update payload with optional note', () => {
    const result = UpdateCapturedInvoicePayloadSchema.parse({
      id: INVOICE_ID,
      note: 'Corrected quantity',
      lines: [],
    });
    expect(result.note).toBe('Corrected quantity');
  });
});
```

- [ ] **Step 2: Run test — confirm it fails on missing module**

```bash
pnpm --filter @reyogo/shared run test
```

Expected: fails with `Cannot find module './invoices'`.

- [ ] **Step 3: Create `packages/shared/src/schemas/invoices.ts`**

```ts
import { z } from 'zod';

export const VatModeSchema = z.enum(['inclusive', 'exclusive', 'non-taxable']);

export const InvoiceLineInputSchema = z.object({
  id: z.string().uuid(),
  itemId: z.string().uuid(),
  itemNameSnapshot: z.string().min(1),
  unitOfMeasure: z.string().nullable().optional(),
  quantity: z.number().positive(),
  vatMode: VatModeSchema,
  vatRate: z.number().min(0).max(1),
  totalVatExclude: z.number().min(0),
});

export const CapturedInvoiceSchema = z.object({
  id: z.string().uuid(),
  invoiceNumber: z.string().nullable().optional(),
  invoiceDate: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().nullable().optional(),
});

export const SaveCapturedInvoicePayloadSchema = z.object({
  id: z.string().uuid(),
  invoiceNumber: z.string().nullable().optional(),
  invoiceDate: z.string().datetime().nullable().optional(),
  lines: z.array(InvoiceLineInputSchema),
});

export const UpdateCapturedInvoicePayloadSchema = z.object({
  id: z.string().uuid(),
  note: z.string().optional(),
  lines: z.array(InvoiceLineInputSchema),
});

export type VatMode = z.infer<typeof VatModeSchema>;
export type InvoiceLineInput = z.infer<typeof InvoiceLineInputSchema>;
export type CapturedInvoice = z.infer<typeof CapturedInvoiceSchema>;
export type SaveCapturedInvoicePayload = z.infer<typeof SaveCapturedInvoicePayloadSchema>;
export type UpdateCapturedInvoicePayload = z.infer<typeof UpdateCapturedInvoicePayloadSchema>;
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
pnpm --filter @reyogo/shared run test -- --reporter=verbose
```

Expected: all invoice tests pass (inventory tests also still pass).

- [ ] **Step 5: Commit**

```bash
git add packages/shared/src/schemas/invoices.ts packages/shared/src/schemas/invoices.test.ts
git commit -m "feat(shared): add Zod schemas for invoice entities

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 5: Setup schemas — TDD

**Files:**
- Create: `packages/shared/src/schemas/setup.test.ts`
- Create: `packages/shared/src/schemas/setup.ts`

- [ ] **Step 1: Create the failing test file**

```ts
import { describe, expect, it } from 'vitest';
import { UnitOfMeasureSchema, CreateUnitOfMeasureSchema } from './setup';

describe('UnitOfMeasureSchema', () => {
  it('accepts a valid unit', () => {
    const result = UnitOfMeasureSchema.parse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Litre',
    });
    expect(result.name).toBe('Litre');
  });

  it('rejects an empty name', () => {
    expect(() =>
      UnitOfMeasureSchema.parse({ id: '550e8400-e29b-41d4-a716-446655440000', name: '' }),
    ).toThrow();
  });

  it('rejects a name exceeding 50 characters', () => {
    expect(() =>
      UnitOfMeasureSchema.parse({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'A'.repeat(51),
      }),
    ).toThrow();
  });

  it('rejects a non-UUID id', () => {
    expect(() => UnitOfMeasureSchema.parse({ id: 'bad', name: 'Litre' })).toThrow();
  });
});

describe('CreateUnitOfMeasureSchema', () => {
  it('accepts a create payload without id', () => {
    const result = CreateUnitOfMeasureSchema.parse({ name: 'Kilogram' });
    expect(result.name).toBe('Kilogram');
  });
});
```

- [ ] **Step 2: Run test — confirm it fails**

```bash
pnpm --filter @reyogo/shared run test
```

Expected: fails with `Cannot find module './setup'`.

- [ ] **Step 3: Create `packages/shared/src/schemas/setup.ts`**

```ts
import { z } from 'zod';

export const UnitOfMeasureSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
});

export const CreateUnitOfMeasureSchema = UnitOfMeasureSchema.omit({ id: true });

export type UnitOfMeasure = z.infer<typeof UnitOfMeasureSchema>;
export type CreateUnitOfMeasure = z.infer<typeof CreateUnitOfMeasureSchema>;
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
pnpm --filter @reyogo/shared run test -- --reporter=verbose
```

Expected: all setup tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/shared/src/schemas/setup.ts packages/shared/src/schemas/setup.test.ts
git commit -m "feat(shared): add Zod schemas for setup entities

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 6: StockMovements schemas — TDD

**Files:**
- Create: `packages/shared/src/schemas/stockMovements.test.ts`
- Create: `packages/shared/src/schemas/stockMovements.ts`

- [ ] **Step 1: Create the failing test file**

```ts
import { describe, expect, it } from 'vitest';
import { StockMovementSchema, StockMovementTypeSchema, StockMovementSourceSchema } from './stockMovements';

const MOVEMENT_ID = '550e8400-e29b-41d4-a716-446655440000';
const ITEM_ID = '550e8400-e29b-41d4-a716-446655440001';

describe('StockMovementTypeSchema', () => {
  it('accepts valid types', () => {
    expect(StockMovementTypeSchema.parse('IN')).toBe('IN');
    expect(StockMovementTypeSchema.parse('OUT')).toBe('OUT');
    expect(StockMovementTypeSchema.parse('ADJUSTMENT')).toBe('ADJUSTMENT');
  });

  it('rejects an invalid type', () => {
    expect(() => StockMovementTypeSchema.parse('TRANSFER')).toThrow();
  });
});

describe('StockMovementSourceSchema', () => {
  it('accepts valid sources', () => {
    expect(StockMovementSourceSchema.parse('invoice')).toBe('invoice');
    expect(StockMovementSourceSchema.parse('usage')).toBe('usage');
    expect(StockMovementSourceSchema.parse('adjustment')).toBe('adjustment');
  });

  it('rejects an invalid source', () => {
    expect(() => StockMovementSourceSchema.parse('manual')).toThrow();
  });
});

describe('StockMovementSchema', () => {
  it('accepts a valid IN movement', () => {
    const result = StockMovementSchema.parse({
      id: MOVEMENT_ID,
      itemId: ITEM_ID,
      itemNameSnapshot: 'Full Cream Milk',
      type: 'IN',
      quantity: 10,
      source: 'invoice',
      createdAt: '2026-05-08T10:00:00.000Z',
    });
    expect(result.type).toBe('IN');
  });

  it('accepts an ADJUSTMENT with negative quantity', () => {
    const result = StockMovementSchema.parse({
      id: MOVEMENT_ID,
      itemId: ITEM_ID,
      itemNameSnapshot: 'Full Cream Milk',
      type: 'ADJUSTMENT',
      quantity: -3,
      source: 'adjustment',
      createdAt: '2026-05-08T10:00:00.000Z',
    });
    expect(result.quantity).toBe(-3);
  });

  it('accepts optional nullable fields as null', () => {
    const result = StockMovementSchema.parse({
      id: MOVEMENT_ID,
      itemId: ITEM_ID,
      itemNameSnapshot: 'Full Cream Milk',
      type: 'OUT',
      quantity: 2,
      source: 'usage',
      referenceId: null,
      costAtTime: null,
      cogsAmount: null,
      createdAt: '2026-05-08T10:00:00.000Z',
    });
    expect(result.referenceId).toBeNull();
  });

  it('rejects a non-ISO createdAt', () => {
    expect(() =>
      StockMovementSchema.parse({
        id: MOVEMENT_ID,
        itemId: ITEM_ID,
        itemNameSnapshot: 'Full Cream Milk',
        type: 'IN',
        quantity: 1,
        source: 'invoice',
        createdAt: 'yesterday',
      }),
    ).toThrow();
  });

  it('rejects a zero quantity', () => {
    expect(() =>
      StockMovementSchema.parse({
        id: MOVEMENT_ID,
        itemId: ITEM_ID,
        itemNameSnapshot: 'Full Cream Milk',
        type: 'IN',
        quantity: 0,
        source: 'invoice',
        createdAt: '2026-05-08T10:00:00.000Z',
      }),
    ).toThrow();
  });
});
```

- [ ] **Step 2: Run test — confirm it fails**

```bash
pnpm --filter @reyogo/shared run test
```

Expected: fails with `Cannot find module './stockMovements'`.

- [ ] **Step 3: Create `packages/shared/src/schemas/stockMovements.ts`**

```ts
import { z } from 'zod';

export const StockMovementTypeSchema = z.enum(['IN', 'OUT', 'ADJUSTMENT']);
export const StockMovementSourceSchema = z.enum(['invoice', 'usage', 'adjustment']);

export const StockMovementSchema = z.object({
  id: z.string().uuid(),
  itemId: z.string().uuid(),
  itemNameSnapshot: z.string().min(1),
  type: StockMovementTypeSchema,
  quantity: z.number().nonzero(),
  source: StockMovementSourceSchema,
  referenceId: z.string().uuid().nullable().optional(),
  costAtTime: z.number().min(0).nullable().optional(),
  cogsAmount: z.number().min(0).nullable().optional(),
  createdAt: z.string().datetime(),
});

export type StockMovementType = z.infer<typeof StockMovementTypeSchema>;
export type StockMovementSource = z.infer<typeof StockMovementSourceSchema>;
export type StockMovement = z.infer<typeof StockMovementSchema>;
```

> **Note on `z.number().nonzero()`:** This allows negative values (for ADJUSTMENT) but rejects 0. If your Zod version doesn't have `.nonzero()`, use `.refine((n) => n !== 0, { message: 'quantity must be non-zero' })` instead.

- [ ] **Step 4: Run tests — confirm they pass**

```bash
pnpm --filter @reyogo/shared run test -- --reporter=verbose
```

Expected: all stockMovements tests pass. Total test count should now be 22+.

- [ ] **Step 5: Commit**

```bash
git add packages/shared/src/schemas/stockMovements.ts packages/shared/src/schemas/stockMovements.test.ts
git commit -m "feat(shared): add Zod schemas for stock movement entities

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 7: Wire barrel exports

**Files:**
- Create: `packages/shared/src/schemas/index.ts`
- Modify: `packages/shared/src/index.ts`

- [ ] **Step 1: Create `packages/shared/src/schemas/index.ts`**

```ts
export * from './inventory';
export * from './invoices';
export * from './setup';
export * from './stockMovements';
```

- [ ] **Step 2: Update `packages/shared/src/index.ts`**

Add the schemas export line:

```ts
export * from './inventory';
export * from './invoices';
export * from './setup';
export * from './stockMovements';
export * from './schemas';
```

- [ ] **Step 3: Typecheck the shared package**

```bash
pnpm --filter @reyogo/shared run typecheck
```

Expected: exits 0.

- [ ] **Step 4: Run all tests one final time**

```bash
pnpm --filter @reyogo/shared run test -- --reporter=verbose
```

Expected: all tests pass, zero failures.

- [ ] **Step 5: Commit**

```bash
git add packages/shared/src/schemas/index.ts packages/shared/src/index.ts
git commit -m "feat(shared): wire schemas barrel export into @reyogo/shared root

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 8: Full workspace verification

- [ ] **Step 1: Typecheck all packages**

```bash
pnpm run typecheck
```

Expected: `@reyogo/config`, `@reyogo/shared`, `@reyogo/desktop`, and `@reyogo/web` all exit 0.

- [ ] **Step 2: Run all tests**

```bash
pnpm run test
```

Expected: shared tests pass; desktop tests pass (if any); web tests pass.

- [ ] **Step 3: Lint all packages**

```bash
pnpm run lint
```

Expected: no lint errors.

---

## Task 9: Move Trello card, push, and open PR

- [ ] **Step 1: Move the Trello card to In Progress**

```bash
TRELLO_KEY=$(security find-generic-password -s "TRELLO_API_KEY" -a "shane" -w)
TRELLO_TOKEN=$(security find-generic-password -s "TRELLO_API_TOKEN" -a "shane" -w)
# In Progress list ID on the reyogo board
curl -s -X PUT "https://api.trello.com/1/cards/69f77fe55c8fd9f619b09a10?idList=69e7ac7f93ff5dcb51f62b75&key=${TRELLO_KEY}&token=${TRELLO_TOKEN}" > /dev/null
echo "Card moved to In Progress"
```

- [ ] **Step 2: Push the branch**

```bash
git push -u origin feat/shared-zod-schemas
```

- [ ] **Step 3: Open the PR**

```bash
gh pr create \
  --title "feat(shared): add Zod validation schemas for all entities" \
  --body "$(cat <<'EOF'
## Summary

- Adds Zod schemas for all entities in `packages/shared`: inventory, invoices, setup, and stock movements
- Exports schema-derived TypeScript types alongside schemas — consumers can use `z.infer` types for HTTP wire format and keep the existing `I*` interfaces for the desktop/SQLite layer
- Adds Vitest to `packages/shared` with one test file per domain (22+ tests covering happy path, missing fields, enum boundaries, and numeric range constraints)
- Adds `./schemas` export path to `packages/shared/package.json` — consumers can import from `@reyogo/shared/schemas` or `@reyogo/shared` root

## Test plan

- [ ] `pnpm --filter @reyogo/shared run test` — all schema tests pass
- [ ] `pnpm run typecheck` — all packages pass
- [ ] `pnpm run lint` — no lint errors
- [ ] `pnpm run test` — full workspace test suite passes

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 4: Move Trello card to Done after PR merges**

Once the PR is merged, run:

```bash
TRELLO_KEY=$(security find-generic-password -s "TRELLO_API_KEY" -a "shane" -w)
TRELLO_TOKEN=$(security find-generic-password -s "TRELLO_API_TOKEN" -a "shane" -w)
# Done list ID
curl -s -X PUT "https://api.trello.com/1/cards/69f77fe55c8fd9f619b09a10?idList=69e7ac806842daf5de4661b2&key=${TRELLO_KEY}&token=${TRELLO_TOKEN}" > /dev/null
echo "Card moved to Done"
```

---

## Self-Review

**Spec coverage:**
- ✅ Zod schemas for InventoryItem, InventoryCategory — Task 3
- ✅ Zod schemas for Invoice, InvoiceLine — Task 4
- ✅ Zod schemas for UnitOfMeasure — Task 5
- ✅ Zod schemas for StockMovement — Task 6
- ✅ Field-level constraints (min/max lengths, positive numbers, ISO dates, UUIDs, enums) — all schema tasks
- ✅ Barrel export from `packages/shared` — Task 7
- ✅ Unit tests covering valid payloads, missing fields, enum boundaries, numeric ranges — Tasks 3–6
- ✅ Browser-safe (no AWS SDK, no Node-only imports — only `zod`) — all schema tasks
- ⚠️ Organisation, User, AppConfig schemas — **not in scope** for this PR. Those entities don't exist in `packages/shared` yet; they'll be added when `packages/lambdas` or the web auth layer is scaffolded.

**Placeholder scan:** No TBDs or incomplete steps found.

**Type consistency:**
- `InvoiceLineInputSchema` used in `SaveCapturedInvoicePayloadSchema` and `UpdateCapturedInvoicePayloadSchema` in Task 4 — consistent.
- `StockMovementTypeSchema` and `StockMovementSourceSchema` defined and used within Task 6 — consistent.
- Barrel in `src/schemas/index.ts` re-exports the same names defined in each domain file — no aliasing that could cause conflicts.
