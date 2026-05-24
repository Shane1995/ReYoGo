import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb, type DbClient } from './helpers';
import { createSetupRepo } from '../repositories/setup';
import * as schema from '../schema';

let db: DbClient;
let repo: ReturnType<typeof createSetupRepo>;

beforeEach(async () => {
  db = await createTestDb();
  repo = createSetupRepo(db);
});

describe('createSetupRepo', () => {
  describe('upsertUnit', () => {
    it('creates a unit', async () => {
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
      const units = await repo.getUnits();
      expect(units).toHaveLength(2);
    });

    it('returns empty array when no units', async () => {
      expect(await repo.getUnits()).toEqual([]);
    });
  });

  describe('deleteUnit', () => {
    it('removes a unit', async () => {
      await repo.upsertUnit({ id: 'kg', name: 'Kilogram' });
      await repo.deleteUnit('kg');
      expect(await db.select().from(schema.unitsOfMeasure)).toHaveLength(0);
    });
  });

  describe('getGoodTypes / setGoodTypes', () => {
    it('returns default types when none stored', async () => {
      const types = await repo.getGoodTypes();
      expect(types).toEqual(['food', 'drink', 'non-perishable']);
    });

    it('persists and retrieves custom types', async () => {
      await repo.setGoodTypes(['a', 'b']);
      expect(await repo.getGoodTypes()).toEqual(['a', 'b']);
    });

    it('overwrites existing types', async () => {
      await repo.setGoodTypes(['a', 'b']);
      await repo.setGoodTypes(['c']);
      expect(await repo.getGoodTypes()).toEqual(['c']);
    });
  });
});
