import { describe, it, expect, beforeAll } from 'vitest';
import * as XLSX from 'xlsx';
import type { IEntity } from '.';

function makeFile(rows: Record<string, unknown>[]): File {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Items');
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer;
  return new File([buf], 'test.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

const entity: Pick<IEntity, 'id' | 'name'> = { id: 'e1', name: 'Pub' };

const validRow = { name: 'Milk', category_name: 'Dairy', unit: 'litres' };

describe('parseFile — Items sheet', () => {
  let parseFile: (
    file: File,
    entity: Pick<IEntity, 'id' | 'name'>,
  ) => Promise<import('.').ParseResult>;

  beforeAll(async () => {
    const mod = await import('.');
    parseFile = mod.parseFile;
  });

  it('assigns the selected entity to all items', async () => {
    const file = makeFile([validRow]);
    const result = await parseFile(file, entity);
    expect(result.errors).toHaveLength(0);
    expect(result.items[0]?.entityId).toBe('e1');
    expect(result.items[0]?.entityName).toBe('Pub');
  });

  it('rejects rows with a missing name', async () => {
    const file = makeFile([{ category_name: 'Dairy' }]);
    const result = await parseFile(file, entity);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.items).toHaveLength(0);
  });

  it('rejects rows with a missing category', async () => {
    const file = makeFile([{ name: 'Milk' }]);
    const result = await parseFile(file, entity);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.items).toHaveLength(0);
  });
});
