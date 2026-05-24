import * as XLSX from 'xlsx';
import { InventoryType } from '@reyogo/types';

export type { InventoryType };

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
}

export interface ParseResult {
  units: ParsedUnit[];
  categories: ParsedCategory[];
  items: ParsedItem[];
  errors: string[];
}

function col(row: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const v = row[key] ?? row[key.toLowerCase()] ?? row[key.toUpperCase()];
    if (v !== undefined && v !== null && String(v).trim()) return String(v).trim();
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
    const type = (col(row, 'type', 'Type', 'category_type', 'Category Type').toLowerCase() ||
      InventoryType.Food) as InventoryType;
    result.categories.push({ name, type });
  });
}

function parseItemsSheet(sheet: XLSX.WorkSheet, result: ParseResult) {
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
    result.items.push({ name, categoryName, unit });
  });
}

export function parseFile(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as ArrayBuffer;
        const wb = XLSX.read(data, { type: 'array' });
        const result: ParseResult = { units: [], categories: [], items: [], errors: [] };

        wb.SheetNames.forEach((name) => {
          const sheet = wb.Sheets[name]!;
          const key = name.toLowerCase();
          if (key === 'units' || key === 'unit') parseUnitsSheet(sheet, result);
          else if (key === 'categories' || key === 'category') parseCategoriesSheet(sheet, result);
          else if (key === 'items' || key === 'item') parseItemsSheet(sheet, result);
        });

        if (
          result.units.length === 0 &&
          result.categories.length === 0 &&
          result.items.length === 0
        ) {
          result.errors.push(
            'No recognised sheets found. Expected sheets named "Units", "Categories", and/or "Items".',
          );
        }

        result.units = dedupe(result.units, (u) => u.name.toLowerCase());
        result.categories = dedupe(result.categories, (c) => c.name.toLowerCase());
        result.items = dedupe(result.items, (i) => i.name.toLowerCase());

        resolve(result);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
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

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer;
  const blob = new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'reyogo-import-template.xlsx';
  a.click();
  URL.revokeObjectURL(url);
}
