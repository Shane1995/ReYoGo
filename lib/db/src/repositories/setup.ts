import { eq } from 'drizzle-orm';
import type { IUnitOfMeasure } from '@reyogo/types';
import type { DbClient } from '../client';
import * as schema from '../schema';
import { now } from '../utils/timestamps';

const GOOD_TYPES_KEY = 'good_types';
const DEFAULT_GOOD_TYPES = ['food', 'drink', 'non-perishable'];

export function createSetupRepo(db: DbClient) {
  return {
    async getUnits(): Promise<IUnitOfMeasure[]> {
      const rows = await db
        .select()
        .from(schema.unitsOfMeasure)
        .orderBy(schema.unitsOfMeasure.createdAt);
      return rows.map((r) => ({ id: r.id, name: r.name }));
    },

    async upsertUnit(unit: IUnitOfMeasure): Promise<void> {
      await db
        .insert(schema.unitsOfMeasure)
        .values({ id: unit.id, accountId: 'default', name: unit.name, createdAt: now() })
        .onConflictDoUpdate({ target: schema.unitsOfMeasure.id, set: { name: unit.name } });
    },

    async deleteUnit(id: string): Promise<void> {
      await db.delete(schema.unitsOfMeasure).where(eq(schema.unitsOfMeasure.id, id));
    },

    async getGoodTypes(): Promise<string[]> {
      const rows = await db
        .select()
        .from(schema.appConfig)
        .where(eq(schema.appConfig.key, GOOD_TYPES_KEY))
        .limit(1);
      if (!rows[0]) return DEFAULT_GOOD_TYPES;
      try {
        return JSON.parse(rows[0].value) as string[];
      } catch {
        return DEFAULT_GOOD_TYPES;
      }
    },

    async setGoodTypes(types: string[]): Promise<void> {
      await db
        .insert(schema.appConfig)
        .values({ key: GOOD_TYPES_KEY, value: JSON.stringify(types) })
        .onConflictDoUpdate({
          target: schema.appConfig.key,
          set: { value: JSON.stringify(types) },
        });
    },
  };
}
