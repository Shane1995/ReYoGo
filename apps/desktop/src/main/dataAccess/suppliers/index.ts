import { asc, eq } from 'drizzle-orm';
import type { ISupplier, IUpsertSupplierPayload } from '@reyogo/types';
import { getDb, schema } from '../../db';
import type { SupplierRow } from '../../db/drizzle/schema';

const now = () => new Date();

function toSupplier(row: SupplierRow): ISupplier {
  return {
    id: row.id,
    name: row.name,
    contactName: row.contactName ?? null,
    phone: row.phone ?? null,
    email: row.email ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function getSuppliers(): Promise<ISupplier[]> {
  const rows = await getDb().select().from(schema.suppliers).orderBy(asc(schema.suppliers.name));
  return rows.map(toSupplier);
}

export async function upsertSupplier(payload: IUpsertSupplierPayload): Promise<void> {
  const ts = now();
  await getDb()
    .insert(schema.suppliers)
    .values({
      id: payload.id,
      accountId: 'default',
      name: payload.name,
      contactName: payload.contactName ?? null,
      phone: payload.phone ?? null,
      email: payload.email ?? null,
      createdAt: ts,
      updatedAt: ts,
    })
    .onConflictDoUpdate({
      target: schema.suppliers.id,
      set: {
        name: payload.name,
        contactName: payload.contactName ?? null,
        phone: payload.phone ?? null,
        email: payload.email ?? null,
        updatedAt: ts,
      },
    });
}

export async function deleteSupplier(id: string): Promise<void> {
  await getDb().delete(schema.suppliers).where(eq(schema.suppliers.id, id));
}
