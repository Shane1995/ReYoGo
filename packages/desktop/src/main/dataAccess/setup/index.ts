import { eq } from 'drizzle-orm';
import type { IUnitOfMeasure, ISetupStatus } from '@shared/types/contract';
import { getDb, schema } from '../../db';

const SETUP_COMPLETE_KEY = 'setup_complete';

export async function getSetupStatus(): Promise<ISetupStatus> {
  const row = await getDb()
    .select()
    .from(schema.appConfig)
    .where(eq(schema.appConfig.key, SETUP_COMPLETE_KEY))
    .limit(1);
  return { isComplete: row.length > 0 && row[0].value === 'true' };
}

export async function completeSetup(): Promise<void> {
  const db = getDb();
  const existing = await db
    .select()
    .from(schema.appConfig)
    .where(eq(schema.appConfig.key, SETUP_COMPLETE_KEY))
    .limit(1);
  if (existing.length > 0) {
    await db
      .update(schema.appConfig)
      .set({ value: 'true' })
      .where(eq(schema.appConfig.key, SETUP_COMPLETE_KEY));
  } else {
    await db.insert(schema.appConfig).values({ key: SETUP_COMPLETE_KEY, value: 'true' });
  }
}

export async function getUnits(): Promise<IUnitOfMeasure[]> {
  const rows = await getDb()
    .select()
    .from(schema.unitsOfMeasure)
    .orderBy(schema.unitsOfMeasure.createdAt);
  return rows.map((r) => ({ id: r.id, name: r.name }));
}

export async function upsertUnit(unit: IUnitOfMeasure): Promise<void> {
  const db = getDb();
  const existing = await db
    .select()
    .from(schema.unitsOfMeasure)
    .where(eq(schema.unitsOfMeasure.id, unit.id))
    .limit(1);
  if (existing.length > 0) {
    await db
      .update(schema.unitsOfMeasure)
      .set({ name: unit.name })
      .where(eq(schema.unitsOfMeasure.id, unit.id));
  } else {
    await db.insert(schema.unitsOfMeasure).values({
      id: unit.id,
      name: unit.name,
      createdAt: new Date(),
    });
  }
}

export async function deleteUnit(id: string): Promise<void> {
  await getDb().delete(schema.unitsOfMeasure).where(eq(schema.unitsOfMeasure.id, id));
}

const GOOD_TYPES_KEY = 'good_types';
const DEFAULT_GOOD_TYPES = ['food', 'drink', 'non-perishable'];

export async function getGoodTypes(): Promise<string[]> {
  const row = await getDb()
    .select()
    .from(schema.appConfig)
    .where(eq(schema.appConfig.key, GOOD_TYPES_KEY))
    .limit(1);
  if (row.length === 0) return DEFAULT_GOOD_TYPES;
  try {
    return JSON.parse(row[0].value) as string[];
  } catch {
    return DEFAULT_GOOD_TYPES;
  }
}

export async function setGoodTypes(types: string[]): Promise<void> {
  const db = getDb();
  const value = JSON.stringify(types);
  const existing = await db
    .select()
    .from(schema.appConfig)
    .where(eq(schema.appConfig.key, GOOD_TYPES_KEY))
    .limit(1);
  if (existing.length > 0) {
    await db.update(schema.appConfig).set({ value }).where(eq(schema.appConfig.key, GOOD_TYPES_KEY));
  } else {
    await db.insert(schema.appConfig).values({ key: GOOD_TYPES_KEY, value });
  }
}
