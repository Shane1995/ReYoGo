import type { ParseResult, ParsedCategory, InventoryType } from './parser';

export type UnitStatus = 'new' | 'exists';
export type CategoryStatus = 'new' | 'exists';
export type ItemStatus = 'new' | 'exists' | 'unresolved';

export interface ReviewUnit {
  name: string;
  status: UnitStatus;
  selected: boolean;
}

export interface ReviewCategory {
  id: string; // temp UUID for UI keying
  name: string;
  type: InventoryType;
  status: CategoryStatus;
  selected: boolean;
  typeWarning?: boolean; // type doesn't match any configured good type
}

export interface ReviewItem {
  name: string;
  categoryName: string;
  unit?: string;
  status: ItemStatus;
  selected: boolean;
  unresolvedReason?: string;
}

export interface ReviewResult {
  units: ReviewUnit[];
  categories: ReviewCategory[];
  items: ReviewItem[];
  parseErrors: string[];
  availableCategories: { name: string; type: InventoryType }[];
  goodTypes: string[];
  counts: {
    newTotal: number;
    existsTotal: number;
    unresolvedTotal: number;
  };
}

export interface ExistingInventory {
  categoryNames: Set<string>;
  itemNames: Set<string>;
  unitNames: Set<string>;
  categoryList?: { name: string; type: InventoryType }[];
  goodTypes?: string[];
}

export function enrichParseResult(
  result: ParseResult,
  existing: ExistingInventory
): ReviewResult {
  const { categoryNames, itemNames, unitNames } = existing;
  const goodTypes = existing.goodTypes ?? [];

  const units: ReviewUnit[] = result.units.map((u) => {
    const exists = unitNames.has(u.name.toLowerCase());
    return { name: u.name, status: exists ? 'exists' : 'new', selected: !exists };
  });

  const importedCatLower = new Map<string, ParsedCategory>(
    result.categories.map((c) => [c.name.toLowerCase(), c])
  );

  const categories: ReviewCategory[] = result.categories.map((c) => {
    const exists = categoryNames.has(c.name.toLowerCase());
    const typeWarning = !exists && goodTypes.length > 0 && !goodTypes.includes(c.type);
    return {
      id: crypto.randomUUID(),
      name: c.name,
      type: c.type,
      status: exists ? 'exists' : 'new',
      selected: !exists,
      typeWarning,
    };
  });

  const willExistCatLower = new Set<string>([
    ...categoryNames,
    ...importedCatLower.keys(),
  ]);

  const items: ReviewItem[] = result.items.map((item) => {
    const catKey = item.categoryName.toLowerCase();
    const alreadyExists = itemNames.has(item.name.toLowerCase());

    if (alreadyExists) {
      return { ...item, status: 'exists', selected: false };
    }
    if (willExistCatLower.has(catKey)) {
      return { ...item, status: 'new', selected: true };
    }
    return {
      ...item,
      status: 'unresolved',
      selected: false,
      unresolvedReason: item.categoryName,
    };
  });

  const seenCatNames = new Set<string>();
  const availableCategories: { name: string; type: InventoryType }[] = [];

  for (const c of existing.categoryList ?? []) {
    const key = c.name.toLowerCase();
    if (!seenCatNames.has(key)) {
      seenCatNames.add(key);
      availableCategories.push(c);
    }
  }
  for (const c of result.categories) {
    const key = c.name.toLowerCase();
    if (!seenCatNames.has(key)) {
      seenCatNames.add(key);
      availableCategories.push({ name: c.name, type: c.type });
    }
  }
  availableCategories.sort((a, b) => a.name.localeCompare(b.name));

  const counts = {
    newTotal: units.filter((u) => u.status === 'new').length + categories.filter((c) => c.status === 'new').length + items.filter((i) => i.status === 'new').length,
    existsTotal: units.filter((u) => u.status === 'exists').length + categories.filter((c) => c.status === 'exists').length + items.filter((i) => i.status === 'exists').length,
    unresolvedTotal: items.filter((i) => i.status === 'unresolved').length,
  };

  return { units, categories, items, parseErrors: result.errors, availableCategories, goodTypes, counts };
}
