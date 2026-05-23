// @vitest-environment node
import { vi, beforeEach, describe, it, expect } from 'vitest';
import * as schema from '../../db/drizzle/schema';
import { createTestDb, type TestDb } from './helpers';

let db: TestDb;

vi.mock('../../db', () => ({ getDb: () => db, schema }));

import { upsertSupplier, getSuppliers, deleteSupplier } from '../suppliers';

beforeEach(async () => {
  db = await createTestDb();
});

describe('suppliers data access', () => {
  describe('upsertSupplier', () => {
    it('creates a new supplier', async () => {
      await upsertSupplier({
        id: 'sup-1',
        name: 'Fresh Foods Ltd',
        contactName: 'John Doe',
        phone: '555-1234',
        email: 'john@freshfoods.com',
      });

      const rows = db.select().from(schema.suppliers).all();
      expect(rows).toHaveLength(1);
      const [row] = rows;
      expect(row!.id).toBe('sup-1');
      expect(row!.name).toBe('Fresh Foods Ltd');
      expect(row!.contactName).toBe('John Doe');
      expect(row!.phone).toBe('555-1234');
      expect(row!.email).toBe('john@freshfoods.com');
    });

    it('updates an existing supplier', async () => {
      await upsertSupplier({ id: 'sup-1', name: 'Fresh Foods Ltd' });
      await upsertSupplier({
        id: 'sup-1',
        name: 'Fresh Foods Co',
        contactName: 'Jane Smith',
        phone: '555-9999',
        email: 'jane@freshfoods.com',
      });

      const rows = db.select().from(schema.suppliers).all();
      expect(rows).toHaveLength(1);
      const [row] = rows;
      expect(row!.name).toBe('Fresh Foods Co');
      expect(row!.contactName).toBe('Jane Smith');
    });
  });

  describe('getSuppliers', () => {
    it('returns suppliers sorted by name', async () => {
      await upsertSupplier({ id: 'sup-3', name: 'Zesty Spices' });
      await upsertSupplier({ id: 'sup-1', name: 'Alpine Dairy' });
      await upsertSupplier({ id: 'sup-2', name: 'Meadow Farms' });

      const suppliers = await getSuppliers();
      expect(suppliers.map((s) => s.name)).toEqual([
        'Alpine Dairy',
        'Meadow Farms',
        'Zesty Spices',
      ]);
    });

    it('returns empty array when no suppliers exist', async () => {
      const suppliers = await getSuppliers();
      expect(suppliers).toEqual([]);
    });

    it('returns supplier with null optional fields', async () => {
      await upsertSupplier({ id: 'sup-1', name: 'Basic Supplier' });

      const [supplier] = await getSuppliers();
      expect(supplier!.contactName).toBeNull();
      expect(supplier!.phone).toBeNull();
      expect(supplier!.email).toBeNull();
    });
  });

  describe('deleteSupplier', () => {
    it('removes a supplier', async () => {
      await upsertSupplier({ id: 'sup-1', name: 'Fresh Foods Ltd' });
      await deleteSupplier('sup-1');

      const rows = db.select().from(schema.suppliers).all();
      expect(rows).toHaveLength(0);
    });

    it('is a no-op when supplier does not exist', async () => {
      await upsertSupplier({ id: 'sup-1', name: 'Fresh Foods Ltd' });
      await deleteSupplier('non-existent');

      const rows = db.select().from(schema.suppliers).all();
      expect(rows).toHaveLength(1);
    });
  });
});
