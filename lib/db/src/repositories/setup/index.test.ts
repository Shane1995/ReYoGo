import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb, type DbClient } from '../../__tests__/helpers';
import { createSetupRepo } from '.';
import * as schema from '../../schema';

let db: DbClient;
let repo: ReturnType<typeof createSetupRepo>;

beforeEach(async () => {
  db = await createTestDb();
  repo = createSetupRepo(db);
});

describe('createSetupRepo', () => {
  describe('upsertUnit', () => {
    it('creates a unit of measure', async () => {
      await repo.upsertUnit({ id: 'kg', name: 'Kilogram' });
      const rows = await db.select().from(schema.unitsOfMeasure);
      expect(rows).toHaveLength(1);
      expect(rows[0]!.name).toBe('Kilogram');
    });

    it('updates an existing unit', async () => {
      await repo.upsertUnit({ id: 'kg', name: 'Kilogram' });
      await repo.upsertUnit({ id: 'kg', name: 'kg' });
      const rows = await db.select().from(schema.unitsOfMeasure);
      expect(rows).toHaveLength(1);
      expect(rows[0]!.name).toBe('kg');
    });
  });

  describe('getUnits', () => {
    it('returns units ordered by createdAt', async () => {
      await repo.upsertUnit({ id: 'kg', name: 'Kilogram' });
      await repo.upsertUnit({ id: 'L', name: 'Litre' });
      expect(await repo.getUnits()).toHaveLength(2);
    });

    it('returns empty array when no units exist', async () => {
      expect(await repo.getUnits()).toEqual([]);
    });
  });

  describe('deleteUnit', () => {
    it('removes the unit', async () => {
      await repo.upsertUnit({ id: 'kg', name: 'Kilogram' });
      await repo.deleteUnit('kg');
      expect(await db.select().from(schema.unitsOfMeasure)).toHaveLength(0);
    });
  });
});
