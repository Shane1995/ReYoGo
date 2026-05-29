import { describe, it, expect, beforeEach } from 'vitest';
import { InventoryType } from '@reyogo/types';
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

    it('hardDeleteUnit throws when unit has assigned items', async () => {
      await db.insert(schema.inventoryCategories).values({
        id: 'cat-1',
        accountId: 'default',
        name: 'Food',
        type: InventoryType.Food,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await db.insert(schema.inventoryItems).values({
        id: 'item-1',
        accountId: 'default',
        entityId: 'default',
        name: 'Milk',
        categoryId: 'cat-1',
        unitOfMeasureId: 'unit-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await expect(repo.hardDeleteUnit('unit-1')).rejects.toThrow();
    });
  });
});
