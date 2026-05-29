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

const entities: IEntity[] = [
  {
    id: 'e1',
    groupId: 'g1',
    name: 'Pub',
    defaultVatRate: 15,
    defaultVatMode: 'exclusive',
    archivedAt: null,
  },
];

const validRow = {
  name: 'Milk',
  category_name: 'Dairy',
  unit: 'litres',
  entity: 'Pub',
};

describe('parseFile — Items sheet entity validation', () => {
  let parseFile: (file: File, entities: IEntity[]) => Promise<import('.').ParseResult>;

  beforeAll(async () => {
    const mod = await import('.');
    parseFile = mod.parseFile;
  });

  it('resolves entityId when entity name matches', async () => {
    const file = makeFile([validRow]);
    const result = await parseFile(file, entities);
    expect(result.errors).toHaveLength(0);
    expect(result.items[0]?.entityId).toBe('e1');
    expect(result.items[0]?.entityName).toBe('Pub');
  });

  it('resolves entityId case-insensitively', async () => {
    const file = makeFile([{ ...validRow, entity: 'pub' }]);
    const result = await parseFile(file, entities);
    expect(result.errors).toHaveLength(0);
    expect(result.items[0]?.entityId).toBe('e1');
  });

  it('rejects rows where entity name is unrecognised', async () => {
    const file = makeFile([{ ...validRow, entity: 'Unknown' }]);
    const result = await parseFile(file, entities);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('Unknown');
    expect(result.errors[0]).toContain('Pub');
    expect(result.items).toHaveLength(0);
  });

  it('rejects rows with a missing entity column', async () => {
    const { entity: _omitted, ...rowWithoutEntity } = validRow;
    const file = makeFile([rowWithoutEntity]);
    const result = await parseFile(file, entities);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('missing an Entity');
    expect(result.items).toHaveLength(0);
  });
});
