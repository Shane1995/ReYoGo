import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb, type DbClient } from '../../__tests__/helpers';
import { createStocktakeRepo } from '.';
import * as schema from '../../schema';

let db: DbClient;
let repo: ReturnType<typeof createStocktakeRepo>;

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
    name: 'Flour',
    categoryId: 'cat-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

async function seedMovement(db: DbClient, itemId: string, stockAfter: number) {
  await db.insert(schema.stockMovements).values({
    id: `mv-${Math.random()}`,
    accountId: 'default',
    inventoryItemId: itemId,
    movementType: 'IN',
    qty: stockAfter,
    stockQtyAfter: stockAfter,
    occurredAt: new Date(),
    createdAt: new Date(),
  });
}

beforeEach(async () => {
  db = await createTestDb();
  repo = createStocktakeRepo(db);
});

describe('createStocktakeRepo', () => {
  describe('createSession', () => {
    it('creates an open session without a label', async () => {
      const session = await repo.createSession();
      expect(session.status).toBe('open');
      expect(session.label).toBeNull();
    });

    it('creates a session with the given label', async () => {
      const session = await repo.createSession('Week 1 count');
      expect(session.label).toBe('Week 1 count');
    });
  });

  describe('getSessions', () => {
    it('returns empty array when no sessions exist', async () => {
      expect(await repo.getSessions()).toEqual([]);
    });

    it('returns all sessions', async () => {
      await repo.createSession('A');
      await repo.createSession('B');
      const sessions = await repo.getSessions();
      expect(sessions).toHaveLength(2);
      expect(sessions.map((s) => s.label)).toContain('A');
      expect(sessions.map((s) => s.label)).toContain('B');
    });
  });

  describe('getSessionById', () => {
    it('returns null for an unknown id', async () => {
      expect(await repo.getSessionById('nope')).toBeNull();
    });

    it('returns the session with its lines after completion', async () => {
      await seedItem(db, 'item-1');
      const session = await repo.createSession();
      await repo.completeSession({
        sessionId: session.id,
        lines: [{ id: 'l-1', inventoryItemId: 'item-1', countedQty: 5 }],
      });
      const result = await repo.getSessionById(session.id);
      expect(result!.status).toBe('complete');
      expect(result!.lines).toHaveLength(1);
      expect(result!.lines[0]!.countedQty).toBe(5);
    });
  });

  describe('completeSession', () => {
    it('throws when the session does not exist', async () => {
      await expect(repo.completeSession({ sessionId: 'nope', lines: [] })).rejects.toThrow(
        'not found',
      );
    });

    it('throws when the session is already complete', async () => {
      const session = await repo.createSession();
      await repo.completeSession({ sessionId: session.id, lines: [] });
      await expect(repo.completeSession({ sessionId: session.id, lines: [] })).rejects.toThrow(
        'already completed',
      );
    });

    it('marks the session as complete', async () => {
      const session = await repo.createSession();
      await repo.completeSession({ sessionId: session.id, lines: [] });
      const result = await repo.getSessionById(session.id);
      expect(result!.status).toBe('complete');
      expect(result!.completedAt).not.toBeNull();
    });

    it('creates no adjustment movement when counted qty matches book qty', async () => {
      await seedItem(db, 'item-1');
      await seedMovement(db, 'item-1', 10);
      const session = await repo.createSession();
      await repo.completeSession({
        sessionId: session.id,
        lines: [{ id: 'l-1', inventoryItemId: 'item-1', countedQty: 10 }],
      });
      const adjustments = (await db.select().from(schema.stockMovements)).filter(
        (m) => m.movementType === 'ADJUSTMENT',
      );
      expect(adjustments).toHaveLength(0);
    });

    it('creates an ADJUSTMENT movement for a positive variance', async () => {
      await seedItem(db, 'item-1');
      await seedMovement(db, 'item-1', 10);
      const session = await repo.createSession();
      await repo.completeSession({
        sessionId: session.id,
        lines: [{ id: 'l-1', inventoryItemId: 'item-1', countedQty: 14 }],
      });
      const adjustments = (await db.select().from(schema.stockMovements)).filter(
        (m) => m.movementType === 'ADJUSTMENT',
      );
      expect(adjustments).toHaveLength(1);
      expect(adjustments[0]!.qty).toBe(4);
      expect(adjustments[0]!.stockQtyAfter).toBe(14);
      expect(adjustments[0]!.referenceId).toBe(session.id);
    });

    it('creates an ADJUSTMENT movement for a negative variance', async () => {
      await seedItem(db, 'item-1');
      await seedMovement(db, 'item-1', 10);
      const session = await repo.createSession();
      await repo.completeSession({
        sessionId: session.id,
        lines: [{ id: 'l-1', inventoryItemId: 'item-1', countedQty: 7 }],
      });
      const adjustments = (await db.select().from(schema.stockMovements)).filter(
        (m) => m.movementType === 'ADJUSTMENT',
      );
      expect(adjustments[0]!.qty).toBe(-3);
      expect(adjustments[0]!.stockQtyAfter).toBe(7);
    });

    it('treats missing book stock as zero when no prior movements exist', async () => {
      await seedItem(db, 'item-1');
      const session = await repo.createSession();
      await repo.completeSession({
        sessionId: session.id,
        lines: [{ id: 'l-1', inventoryItemId: 'item-1', countedQty: 5 }],
      });
      const adjustments = (await db.select().from(schema.stockMovements)).filter(
        (m) => m.movementType === 'ADJUSTMENT',
      );
      expect(adjustments[0]!.qty).toBe(5);
      expect(adjustments[0]!.stockQtyAfter).toBe(5);
    });
  });
});
