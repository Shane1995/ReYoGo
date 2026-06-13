import { describe, it, expect, beforeAll } from 'vitest';
import * as XLSX from 'xlsx';
import { InventoryType, type IEntity } from '@reyogo/types';

function makeFile(sheets: Record<string, Record<string, unknown>[]>): File {
  const wb = XLSX.utils.book_new();
  for (const [sheetName, rows] of Object.entries(sheets)) {
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  }
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer;
  return new File([buf], 'test.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

const entity: Pick<IEntity, 'id' | 'name'> = { id: 'e1', name: 'Pub' };

describe('parseFile', () => {
  let parseFile: (
    file: File,
    entity: Pick<IEntity, 'id' | 'name'>,
  ) => Promise<import('.').ParseResult>;

  beforeAll(async () => {
    const mod = await import('.');
    parseFile = mod.parseFile;
  });

  describe('Items sheet', () => {
    const validRow = { name: 'Milk', category_name: 'Dairy', unit: 'litres' };

    it('assigns the selected entity to all items', async () => {
      const file = makeFile({ Items: [validRow] });
      const result = await parseFile(file, entity);
      expect(result.errors).toHaveLength(0);
      expect(result.items[0]?.entityId).toBe('e1');
      expect(result.items[0]?.entityName).toBe('Pub');
    });

    it('rejects rows with a missing name', async () => {
      const file = makeFile({ Items: [{ category_name: 'Dairy' }] });
      const result = await parseFile(file, entity);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.items).toHaveLength(0);
    });

    it('rejects rows with a missing category', async () => {
      const file = makeFile({ Items: [{ name: 'Milk' }] });
      const result = await parseFile(file, entity);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.items).toHaveLength(0);
    });

    it('matches a singular "Item" sheet name', async () => {
      const file = makeFile({ Item: [validRow] });
      const result = await parseFile(file, entity);
      expect(result.items).toHaveLength(1);
    });

    it('deduplicates items with the same name case-insensitively', async () => {
      const file = makeFile({
        Items: [validRow, { name: 'milk', category_name: 'Dairy', unit: 'litres' }],
      });
      const result = await parseFile(file, entity);
      expect(result.items).toHaveLength(1);
    });
  });

  describe('Units sheet', () => {
    it('parses unit names', async () => {
      const file = makeFile({ Units: [{ name: 'litres' }, { name: 'kgs' }] });
      const result = await parseFile(file, entity);
      expect(result.units).toEqual([{ name: 'litres' }, { name: 'kgs' }]);
    });

    it('matches a singular "Unit" sheet name', async () => {
      const file = makeFile({ Unit: [{ name: 'litres' }] });
      const result = await parseFile(file, entity);
      expect(result.units).toEqual([{ name: 'litres' }]);
    });

    it('matches an all-caps header', async () => {
      const file = makeFile({ Units: [{ NAME: 'litres' }] });
      const result = await parseFile(file, entity);
      expect(result.units).toEqual([{ name: 'litres' }]);
    });

    it('trims whitespace and falls back to the next column when blank', async () => {
      const file = makeFile({ Units: [{ name: '   ', Name: '  kgs  ' }] });
      const result = await parseFile(file, entity);
      expect(result.units).toEqual([{ name: 'kgs' }]);
    });

    it('rejects rows with a missing name', async () => {
      const file = makeFile({ Units: [{ other: 'x' }] });
      const result = await parseFile(file, entity);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.units).toHaveLength(0);
    });
  });

  describe('Categories sheet', () => {
    it('parses a recognised category type', async () => {
      const file = makeFile({ Categories: [{ name: 'Beverages', type: InventoryType.Beverage }] });
      const result = await parseFile(file, entity);
      expect(result.categories).toEqual([{ name: 'Beverages', type: InventoryType.Beverage }]);
    });

    it('matches a singular "Category" sheet name', async () => {
      const file = makeFile({ Category: [{ name: 'Dairy', type: InventoryType.Food }] });
      const result = await parseFile(file, entity);
      expect(result.categories).toEqual([{ name: 'Dairy', type: InventoryType.Food }]);
    });

    it('defaults to "food" when no type is given', async () => {
      const file = makeFile({ Categories: [{ name: 'Dairy' }] });
      const result = await parseFile(file, entity);
      expect(result.categories).toEqual([{ name: 'Dairy', type: InventoryType.Food }]);
    });

    it('defaults to "food" when the type is unrecognised', async () => {
      const file = makeFile({ Categories: [{ name: 'Misc', type: 'unknown' }] });
      const result = await parseFile(file, entity);
      expect(result.categories).toEqual([{ name: 'Misc', type: InventoryType.Food }]);
    });

    it('rejects rows with a missing name', async () => {
      const file = makeFile({ Categories: [{ type: InventoryType.Food }] });
      const result = await parseFile(file, entity);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.categories).toHaveLength(0);
    });
  });

  describe('sheet routing', () => {
    it('ignores sheets with unrecognised names', async () => {
      const file = makeFile({ Notes: [{ name: 'irrelevant' }] });
      const result = await parseFile(file, entity);
      expect(result.units).toHaveLength(0);
      expect(result.categories).toHaveLength(0);
      expect(result.items).toHaveLength(0);
    });

    it('reports an error when no recognised sheets are present', async () => {
      const file = makeFile({ Notes: [{ name: 'irrelevant' }] });
      const result = await parseFile(file, entity);
      expect(result.errors).toContain(
        'No recognised sheets found. Expected sheets named "Units", "Categories", and/or "Items".',
      );
    });
  });
});
