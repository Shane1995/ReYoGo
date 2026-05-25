import { eq } from 'drizzle-orm';
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
        .orderBy(schema.unitsOfMeasure.createdAt);
      return rows.map((r) => ({ id: r.id, name: r.name }));
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
