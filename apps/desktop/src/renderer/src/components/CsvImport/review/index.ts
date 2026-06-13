import type { ParseResult, ParsedCategory, ParsedItem } from '../parser';
import { InventoryType, INVENTORY_TYPES } from '@reyogo/types';

export type { InventoryType };

export const UNIT_STATUS = { New: 'new', Exists: 'exists' } as const;
export type UnitStatus = (typeof UNIT_STATUS)[keyof typeof UNIT_STATUS];

export const CATEGORY_STATUS = { New: 'new', Exists: 'exists' } as const;
export type CategoryStatus = (typeof CATEGORY_STATUS)[keyof typeof CATEGORY_STATUS];

export const ITEM_STATUS = { New: 'new', Exists: 'exists', Unresolved: 'unresolved' } as const;
export type ItemStatus = (typeof ITEM_STATUS)[keyof typeof ITEM_STATUS];

export interface ReviewUnit {
  name: string;
  status: UnitStatus;
  selected: boolean;
}

export interface ReviewCategory {
  id: string;
  name: string;
  type: InventoryType;
  status: CategoryStatus;
  selected: boolean;
  typeWarning?: boolean;
}

export interface ReviewItem {
  name: string;
  categoryName: string;
  unit?: string;
  entityId?: string;
  entityName?: string;
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
}

function resolveItemStatus(
  item: ParsedItem,
  itemNames: Set<string>,
  willExistCatLower: Set<string>,
): ReviewItem {
  if (itemNames.has(item.name.toLowerCase())) {
    return { ...item, status: ITEM_STATUS.Exists, selected: false };
  }
  if (!item.unit) {
    return {
      ...item,
      status: ITEM_STATUS.Unresolved,
      selected: false,
      unresolvedReason: 'No unit of measure — add a Unit column to your spreadsheet',
    };
  }
  if (willExistCatLower.has(item.categoryName.toLowerCase())) {
    return { ...item, status: ITEM_STATUS.New, selected: true };
  }
  return {
    ...item,
    status: ITEM_STATUS.Unresolved,
    selected: false,
    unresolvedReason: `Category not found: ${item.categoryName}`,
  };
}

type AvailableCategory = { name: string; type: InventoryType };

function addUniqueCategory(
  acc: AvailableCategory[],
  seen: Set<string>,
  category: AvailableCategory,
) {
  const key = category.name.toLowerCase();
  if (seen.has(key)) return;
  seen.add(key);
  acc.push(category);
}

function buildAvailableCategories(
  categoryList: AvailableCategory[],
  imported: ParsedCategory[],
): AvailableCategory[] {
  const seen = new Set<string>();
  const result: AvailableCategory[] = [];
  for (const c of categoryList) addUniqueCategory(result, seen, c);
  for (const c of imported) addUniqueCategory(result, seen, { name: c.name, type: c.type });
  result.sort((a, b) => a.name.localeCompare(b.name));
  return result;
}

export function enrichParseResult(result: ParseResult, existing: ExistingInventory): ReviewResult {
  const { categoryNames, itemNames, unitNames } = existing;

  const units: ReviewUnit[] = result.units.map((u) => {
    const exists = unitNames.has(u.name.toLowerCase());
    return {
      name: u.name,
      status: exists ? UNIT_STATUS.Exists : UNIT_STATUS.New,
      selected: !exists,
    };
  });

  const importedCatLower = new Map<string, ParsedCategory>(
    result.categories.map((c) => [c.name.toLowerCase(), c]),
  );

  const categories: ReviewCategory[] = result.categories.map((c) => {
    const exists = categoryNames.has(c.name.toLowerCase());
    const typeWarning = !exists && !INVENTORY_TYPES.includes(c.type);
    return {
      id: crypto.randomUUID(),
      name: c.name,
      type: c.type,
      status: exists ? CATEGORY_STATUS.Exists : CATEGORY_STATUS.New,
      selected: !exists,
      typeWarning,
    };
  });

  const willExistCatLower = new Set<string>([...categoryNames, ...importedCatLower.keys()]);

  const items: ReviewItem[] = result.items.map((item) =>
    resolveItemStatus(item, itemNames, willExistCatLower),
  );

  const availableCategories = buildAvailableCategories(
    existing.categoryList ?? [],
    result.categories,
  );

  const counts = {
    newTotal:
      units.filter((u) => u.status === UNIT_STATUS.New).length +
      categories.filter((c) => c.status === CATEGORY_STATUS.New).length +
      items.filter((i) => i.status === ITEM_STATUS.New).length,
    existsTotal:
      units.filter((u) => u.status === UNIT_STATUS.Exists).length +
      categories.filter((c) => c.status === CATEGORY_STATUS.Exists).length +
      items.filter((i) => i.status === ITEM_STATUS.Exists).length,
    unresolvedTotal: items.filter((i) => i.status === ITEM_STATUS.Unresolved).length,
  };

  return {
    units,
    categories,
    items,
    parseErrors: result.errors,
    availableCategories,
    counts,
  };
}
