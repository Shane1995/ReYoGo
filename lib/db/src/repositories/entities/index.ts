import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { VatMode } from '@reyogo/types';
import type { IBusinessGroup, IEntity } from '@reyogo/types';
import type { DbClient } from '../../client';
import * as schema from '../../schema';

function toIEntity(row: schema.EntityRow): IEntity {
  return {
    id: row.id,
    groupId: row.groupId,
    name: row.name,
    defaultVatRate: row.defaultVatRate,
    defaultVatMode: row.defaultVatMode,
    archivedAt: row.archivedAt ?? null,
  };
}

async function getGroup(db: DbClient, accountId: string): Promise<IBusinessGroup | null> {
  const rows = await db
    .select()
    .from(schema.businessGroups)
    .where(eq(schema.businessGroups.accountId, accountId))
    .limit(1);
  if (!rows[0]) return null;
  return { id: rows[0].id, name: rows[0].name };
}

async function getEntities(db: DbClient, accountId: string): Promise<IEntity[]> {
  const groupRows = await db
    .select({ id: schema.businessGroups.id })
    .from(schema.businessGroups)
    .where(eq(schema.businessGroups.accountId, accountId))
    .limit(1);
  if (!groupRows[0]) return [];
  const rows = await db
    .select()
    .from(schema.entities)
    .where(eq(schema.entities.groupId, groupRows[0].id))
    .orderBy(schema.entities.createdAt);
  return rows.filter((r) => !r.archivedAt).map(toIEntity);
}

async function updateGroupName(db: DbClient, groupId: string, name: string): Promise<void> {
  await db.update(schema.businessGroups).set({ name }).where(eq(schema.businessGroups.id, groupId));
}

async function createEntity(
  db: DbClient,
  input: { id: string; groupId: string; name: string },
): Promise<void> {
  await db.insert(schema.entities).values({
    id: input.id,
    groupId: input.groupId,
    name: input.name,
    defaultVatRate: 15,
    defaultVatMode: VatMode.Exclusive,
    createdAt: new Date(),
  });
}

async function renameEntity(db: DbClient, entityId: string, name: string): Promise<void> {
  await db.update(schema.entities).set({ name }).where(eq(schema.entities.id, entityId));
}

async function updateEntityVat(
  db: DbClient,
  entityId: string,
  vatRate: number,
  vatMode: VatMode,
): Promise<void> {
  await db
    .update(schema.entities)
    .set({ defaultVatRate: vatRate, defaultVatMode: vatMode })
    .where(eq(schema.entities.id, entityId));
}

async function getSetupState(db: DbClient, accountId: string): Promise<{ setupComplete: boolean }> {
  const rows = await db
    .select({ setupComplete: schema.accounts.setupComplete })
    .from(schema.accounts)
    .where(eq(schema.accounts.id, accountId))
    .limit(1);
  return { setupComplete: rows[0]?.setupComplete ?? false };
}

async function completeSetup(
  db: DbClient,
  accountId: string,
  groupName: string,
  entityNames: string[],
): Promise<void> {
  await db.transaction(async (tx) => {
    const groupRows = await tx
      .select()
      .from(schema.businessGroups)
      .where(eq(schema.businessGroups.accountId, accountId))
      .limit(1);

    let groupId: string;
    if (groupRows[0]) {
      groupId = groupRows[0].id;
      await tx
        .update(schema.businessGroups)
        .set({ name: groupName })
        .where(eq(schema.businessGroups.id, groupId));
    } else {
      groupId = randomUUID();
      await tx.insert(schema.businessGroups).values({
        id: groupId,
        accountId,
        name: groupName,
        createdAt: new Date(),
      });
    }

    const existing = await tx
      .select()
      .from(schema.entities)
      .where(eq(schema.entities.groupId, groupId))
      .orderBy(schema.entities.createdAt);

    for (let i = 0; i < entityNames.length; i++) {
      const existingRow = existing[i];
      const name = entityNames[i];
      if (existingRow && name) {
        await tx
          .update(schema.entities)
          .set({ name })
          .where(eq(schema.entities.id, existingRow.id));
      } else if (name) {
        await tx.insert(schema.entities).values({
          id: randomUUID(),
          groupId,
          name,
          defaultVatRate: 15,
          defaultVatMode: VatMode.Exclusive,
          createdAt: new Date(),
        });
      }
    }

    await tx
      .update(schema.accounts)
      .set({ setupComplete: true })
      .where(eq(schema.accounts.id, accountId));
  });
}

export function createEntitiesRepo(db: DbClient) {
  return {
    getGroup: (accountId: string) => getGroup(db, accountId),
    getEntities: (accountId: string) => getEntities(db, accountId),
    updateGroupName: (groupId: string, name: string) => updateGroupName(db, groupId, name),
    createEntity: (input: { id: string; groupId: string; name: string }) => createEntity(db, input),
    renameEntity: (entityId: string, name: string) => renameEntity(db, entityId, name),
    updateEntityVat: (entityId: string, vatRate: number, vatMode: VatMode) =>
      updateEntityVat(db, entityId, vatRate, vatMode),
    getSetupState: (accountId: string) => getSetupState(db, accountId),
    completeSetup: (accountId: string, groupName: string, entityNames: string[]) =>
      completeSetup(db, accountId, groupName, entityNames),
  };
}
