import * as XLSX from 'xlsx';
import { InventoryType } from '@reyogo/types';
import type { IEntity } from '@reyogo/types';

export interface ParsedUnit {
  name: string;
}

export interface ParsedCategory {
  name: string;
  type: InventoryType;
}

export interface ParsedItem {
  name: string;
  categoryName: string;
  unit?: string;
  entityId?: string;
  entityName?: string;
}

export interface ParseResult {
  units: ParsedUnit[];
  categories: ParsedCategory[];
  items: ParsedItem[];
  errors: string[];
}

type ParsingEntity = Pick<IEntity, 'id' | 'name'>;

function firstValue(row: Record<string, unknown>, key: string): unknown {
  return row[key] ?? row[key.toLowerCase()] ?? row[key.toUpperCase()];
}

function col(row: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const text = String(firstValue(row, key) ?? '').trim();
    if (text) return text;
  }
  return '';
}

function dedupe<T>(arr: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  return arr.filter((item) => {
    const k = key(item);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function normaliseCategoryType(rawType: string): InventoryType {
  if (rawType === InventoryType.Beverage) return InventoryType.Beverage;
  if (rawType === InventoryType.NonFood) return InventoryType.NonFood;
  return InventoryType.Food;
}

function parseUnitsSheet(sheet: XLSX.WorkSheet, result: ParseResult) {
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
  rows.forEach((row, i) => {
    const name = col(row, 'name', 'Name', 'unit', 'Unit');
    if (!name) {
      result.errors.push(`Units row ${i + 2}: missing name`);
      return;
    }
    result.units.push({ name });
  });
}

function parseCategoriesSheet(sheet: XLSX.WorkSheet, result: ParseResult) {
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
  rows.forEach((row, i) => {
    const name = col(row, 'name', 'Name', 'category', 'Category');
    if (!name) {
      result.errors.push(`Categories row ${i + 2}: missing name`);
      return;
    }
    const rawType = col(row, 'type', 'Type', 'category_type', 'Category Type').toLowerCase();
    const type = normaliseCategoryType(rawType || InventoryType.Food);
    result.categories.push({ name, type });
  });
}

function parseItemsSheet(sheet: XLSX.WorkSheet, result: ParseResult, entity: ParsingEntity) {
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
  rows.forEach((row, i) => {
    const name = col(row, 'name', 'Name', 'item', 'Item');
    if (!name) {
      result.errors.push(`Items row ${i + 2}: missing name`);
      return;
    }
    const categoryName = col(row, 'category_name', 'Category Name', 'category', 'Category');
    if (!categoryName) {
      result.errors.push(`Items row ${i + 2}: "${name}" has no category`);
      return;
    }
    const unit = col(row, 'unit', 'Unit', 'unit_of_measure', 'Unit of Measure') || undefined;
    result.items.push({ name, categoryName, unit, entityId: entity.id, entityName: entity.name });
  });
}

type SheetParser = (sheet: XLSX.WorkSheet, result: ParseResult, entity: ParsingEntity) => void;

const SHEET_PARSERS: Record<string, SheetParser> = {
  units: (sheet, result) => parseUnitsSheet(sheet, result),
  unit: (sheet, result) => parseUnitsSheet(sheet, result),
  categories: (sheet, result) => parseCategoriesSheet(sheet, result),
  category: (sheet, result) => parseCategoriesSheet(sheet, result),
  items: parseItemsSheet,
  item: parseItemsSheet,
};

function routeSheet(
  name: string,
  sheet: XLSX.WorkSheet,
  result: ParseResult,
  entity: ParsingEntity,
) {
  const parse = SHEET_PARSERS[name.toLowerCase()];
  if (parse) parse(sheet, result, entity);
}

function readArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      if (data instanceof ArrayBuffer) resolve(data);
      else reject(new Error('Unexpected result type'));
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

function buildParseResult(wb: XLSX.WorkBook, entity: ParsingEntity): ParseResult {
  const result: ParseResult = { units: [], categories: [], items: [], errors: [] };

  wb.SheetNames.forEach((name) => routeSheet(name, wb.Sheets[name]!, result, entity));

  if (result.units.length === 0 && result.categories.length === 0 && result.items.length === 0) {
    result.errors.push(
      'No recognised sheets found. Expected sheets named "Units", "Categories", and/or "Items".',
    );
  }

  result.units = dedupe(result.units, (u) => u.name.toLowerCase());
  result.categories = dedupe(result.categories, (c) => c.name.toLowerCase());
  result.items = dedupe(result.items, (i) => i.name.toLowerCase());

  return result;
}

export async function parseFile(file: File, entity: ParsingEntity): Promise<ParseResult> {
  const data = await readArrayBuffer(file);
  const wb = XLSX.read(data, { type: 'array' });
  return buildParseResult(wb, entity);
}

export function downloadTemplate(): void {
  const wb = XLSX.utils.book_new();

  const unitsSheet = XLSX.utils.aoa_to_sheet([['name'], ['litres'], ['kgs'], ['unit'], ['pieces']]);
  unitsSheet['!cols'] = [{ wch: 20 }];
  XLSX.utils.book_append_sheet(wb, unitsSheet, 'Units');

  const catRows: (string | undefined)[][] = [['name', 'type']];
  catRows.push(['Dairy', InventoryType.Food]);
  catRows.push(['Beverages', InventoryType.Beverage]);
  catRows.push(['Cleaning Supplies', InventoryType.NonFood]);
  const catsSheet = XLSX.utils.aoa_to_sheet(catRows);
  catsSheet['!cols'] = [{ wch: 24 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, catsSheet, 'Categories');

  const itemsSheet = XLSX.utils.aoa_to_sheet([
    ['name', 'category_name', 'unit'],
    ['Full Cream Milk', 'Dairy', 'litres'],
    ['Orange Juice', 'Beverages', 'litres'],
    ['Bleach', 'Cleaning Supplies', 'unit'],
  ]);
  itemsSheet['!cols'] = [{ wch: 28 }, { wch: 24 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, itemsSheet, 'Items');

  const base64: string = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
  window.electronAPI.ipcRenderer.invoke('shell:save-file-base64', {
    filename: 'reyogo-import-template.xlsx',
    base64,
  });
}
