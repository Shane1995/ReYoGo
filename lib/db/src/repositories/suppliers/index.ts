import { asc, eq } from 'drizzle-orm';
import type { Supplier, UpsertSupplierPayload } from '@reyogo/types';
import type { DbClient } from '../../client';
import * as schema from '../../schema';
import type { SupplierRow } from '../../schema';
import { now } from '../../utils/timestamps';

function toSupplier(row: SupplierRow): Supplier {
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

export function createSuppliersRepo(db: DbClient) {
  return {
    async getSuppliers(entityId: string): Promise<Supplier[]> {
      const rows = await db
        .select()
        .from(schema.suppliers)
        .where(eq(schema.suppliers.entityId, entityId))
        .orderBy(asc(schema.suppliers.name));
      return rows.map(toSupplier);
    },

    async upsertSupplier(payload: UpsertSupplierPayload, entityId: string): Promise<void> {
      const ts = now();
      await db
        .insert(schema.suppliers)
        .values({
          id: payload.id,
          entityId,
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
    },

    async deleteSupplier(id: string): Promise<void> {
      await db.delete(schema.suppliers).where(eq(schema.suppliers.id, id));
    },
  };
}
