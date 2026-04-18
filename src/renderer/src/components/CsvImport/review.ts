import type { ParseResult, ParsedCategory, InventoryType } from './parser';

// ─── Output types ─────────────────────────────────────────────────────────────

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
  /** Why the item is unresolved (original category name when status is unresolved) */
  unresolvedReason?: string;
}

export interface ReviewResult {
  units: ReviewUnit[];
  categories: ReviewCategory[];
  items: ReviewItem[];
  parseErrors: string[];
  /** All categories available for assigning to unresolved items (DB + import sheet) */
  availableCategories: { name: string; type: InventoryType }[];
  goodTypes: string[];
  counts: {
    newTotal: number;
    existsTotal: number;
    unresolvedTotal: number;
  };
}

// ─── Enrichment ───────────────────────────────────────────────────────────────

export interface ExistingInventory {
  categoryNames: Set<string>; // lowercase
  itemNames: Set<string>;     // lowercase
  unitNames: Set<string>;     // lowercase
  categoryList?: { name: string; type: InventoryType }[];
  goodTypes?: string[];
}

export function enrichParseResult(
  result: ParseResult,
  existing: ExistingInventory
): ReviewResult {
  const { categoryNames, itemNames, unitNames } = existing;
  const goodTypes = existing.goodTypes ?? [];

  // ── Units ──────────────────────────────────────────────────────────────────
  const units: ReviewUnit[] = result.units.map((u) => {
    const exists = unitNames.has(u.name.toLowerCase());
    return { name: u.name, status: exists ? 'exists' : 'new', selected: !exists };
  });

  // ── Categories from the categories sheet ──────────────────────────────────
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

  // ── Items ──────────────────────────────────────────────────────────────────
  // Categories that will exist: existing DB + explicitly imported categories
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

  // ── Available categories for assigning to unresolved items ────────────────
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

  // ── Summary counts ────────────────────────────────────────────────────────
  const allRows = [
    ...units.map((u) => u.status as string),
    ...categories.map((c) => c.status as string),
    ...items.map((i) => i.status as string),
  ];

  const counts = {
    newTotal: allRows.filter((s) => s === 'new').length,
    existsTotal: allRows.filter((s) => s === 'exists').length,
    unresolvedTotal: items.filter((i) => i.status === 'unresolved').length,
  };

  return { units, categories, items, parseErrors: result.errors, availableCategories, goodTypes, counts };
}
