import type { InventoryType } from '@reyogo/types';

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
