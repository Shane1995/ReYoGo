import { eq, isNull, isNotNull, count } from 'drizzle-orm';
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
      const [result] = await db
        .select({ n: count() })
        .from(schema.inventoryItems)
        .where(eq(schema.inventoryItems.unitOfMeasureId, id));
      return result?.n ?? 0;
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
      const [result] = await db
        .select({ n: count() })
        .from(schema.inventoryItems)
        .where(eq(schema.inventoryItems.unitOfMeasureId, id));
      const usage = result?.n ?? 0;
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
