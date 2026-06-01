import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb, TEST_ENTITY_ID, type DbClient } from '../../__tests__/helpers';
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
      await repo.upsertSupplier(
        {
          id: 'sup-1',
          entityId: TEST_ENTITY_ID,
          name: 'Fresh Foods',
          contactName: 'John',
          phone: '555',
          email: 'j@f.com',
        },
        TEST_ENTITY_ID,
      );
      const rows = await db.select().from(schema.suppliers);
      expect(rows).toHaveLength(1);
      expect(rows[0]!.name).toBe('Fresh Foods');
      expect(rows[0]!.entityId).toBe(TEST_ENTITY_ID);
    });

    it('updates an existing supplier', async () => {
      await repo.upsertSupplier(
        { id: 'sup-1', entityId: TEST_ENTITY_ID, name: 'Fresh Foods' },
        TEST_ENTITY_ID,
      );
      await repo.upsertSupplier(
        { id: 'sup-1', entityId: TEST_ENTITY_ID, name: 'Fresh Foods Co' },
        TEST_ENTITY_ID,
      );
      const rows = await db.select().from(schema.suppliers);
      expect(rows).toHaveLength(1);
      expect(rows[0]!.name).toBe('Fresh Foods Co');
    });
  });

  describe('getSuppliers', () => {
    it('returns suppliers for the given entity sorted by name', async () => {
      await repo.upsertSupplier(
        { id: 'sup-2', entityId: TEST_ENTITY_ID, name: 'Zesty' },
        TEST_ENTITY_ID,
      );
      await repo.upsertSupplier(
        { id: 'sup-1', entityId: TEST_ENTITY_ID, name: 'Alpine' },
        TEST_ENTITY_ID,
      );
      const suppliers = await repo.getSuppliers(TEST_ENTITY_ID);
      expect(suppliers.map((s) => s.name)).toEqual(['Alpine', 'Zesty']);
    });

    it('does not return suppliers from other entities', async () => {
      await repo.upsertSupplier(
        { id: 'sup-1', entityId: TEST_ENTITY_ID, name: 'Mine' },
        TEST_ENTITY_ID,
      );
      const suppliers = await repo.getSuppliers('other-entity');
      expect(suppliers).toHaveLength(0);
    });

    it('returns null for unset optional fields', async () => {
      await repo.upsertSupplier(
        { id: 'sup-1', entityId: TEST_ENTITY_ID, name: 'Basic' },
        TEST_ENTITY_ID,
      );
      const [s] = await repo.getSuppliers(TEST_ENTITY_ID);
      expect(s!.contactName).toBeNull();
      expect(s!.phone).toBeNull();
      expect(s!.email).toBeNull();
    });

    it('returns empty array when no suppliers exist for entity', async () => {
      expect(await repo.getSuppliers(TEST_ENTITY_ID)).toEqual([]);
    });
  });

  describe('deleteSupplier', () => {
    it('removes the supplier', async () => {
      await repo.upsertSupplier(
        { id: 'sup-1', entityId: TEST_ENTITY_ID, name: 'Fresh Foods' },
        TEST_ENTITY_ID,
      );
      await repo.deleteSupplier('sup-1');
      expect(await db.select().from(schema.suppliers)).toHaveLength(0);
    });
  });
});
