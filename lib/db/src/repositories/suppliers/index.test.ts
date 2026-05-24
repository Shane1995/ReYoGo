import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb, type DbClient } from '../../__tests__/helpers';
import { createSuppliersRepo } from '.';
import * as schema from '../../schema';

let db: DbClient;
let repo: ReturnType<typeof createSuppliersRepo>;

beforeEach(async () => {
  db = await createTestDb();
  repo = createSuppliersRepo(db);
});

describe('createSuppliersRepo', () => {
  describe('upsertSupplier', () => {
    it('creates a new supplier', async () => {
      await repo.upsertSupplier({
        id: 'sup-1',
        name: 'Fresh Foods',
        contactName: 'John',
        phone: '555',
        email: 'j@f.com',
      });
      const rows = await db.select().from(schema.suppliers);
      expect(rows).toHaveLength(1);
      expect(rows[0]!.name).toBe('Fresh Foods');
    });

    it('updates an existing supplier', async () => {
      await repo.upsertSupplier({ id: 'sup-1', name: 'Fresh Foods' });
      await repo.upsertSupplier({ id: 'sup-1', name: 'Fresh Foods Co' });
      const rows = await db.select().from(schema.suppliers);
      expect(rows).toHaveLength(1);
      expect(rows[0]!.name).toBe('Fresh Foods Co');
    });
  });

  describe('getSuppliers', () => {
    it('returns suppliers sorted by name', async () => {
      await repo.upsertSupplier({ id: 'sup-2', name: 'Zesty' });
      await repo.upsertSupplier({ id: 'sup-1', name: 'Alpine' });
      const suppliers = await repo.getSuppliers();
      expect(suppliers.map((s) => s.name)).toEqual(['Alpine', 'Zesty']);
    });

    it('returns null for unset optional fields', async () => {
      await repo.upsertSupplier({ id: 'sup-1', name: 'Basic' });
      const [s] = await repo.getSuppliers();
      expect(s!.contactName).toBeNull();
      expect(s!.phone).toBeNull();
      expect(s!.email).toBeNull();
    });

    it('returns empty array when no suppliers exist', async () => {
      expect(await repo.getSuppliers()).toEqual([]);
    });
  });

  describe('deleteSupplier', () => {
    it('removes the supplier', async () => {
      await repo.upsertSupplier({ id: 'sup-1', name: 'Fresh Foods' });
      await repo.deleteSupplier('sup-1');
      expect(await db.select().from(schema.suppliers)).toHaveLength(0);
    });
  });
});
