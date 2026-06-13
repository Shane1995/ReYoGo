import type { ParseResult, ParsedCategory, ParsedItem } from '../parser';
import { INVENTORY_TYPES } from '@reyogo/types';
import { ReviewStatus } from './constants';
import type { ItemStatus } from './constants';
import type {
  InventoryType,
  ReviewUnit,
  ReviewCategory,
  ReviewItem,
  ReviewResult,
  ExistingInventory,
} from './types';

export { ReviewStatus };
export type { ItemStatus, InventoryType };
export type { ReviewUnit, ReviewCategory, ReviewItem, ReviewResult, ExistingInventory };

function resolveItemStatus(
  item: ParsedItem,
  itemNames: Set<string>,
  willExistCatLower: Set<string>,
): ReviewItem {
  if (itemNames.has(item.name.toLowerCase())) {
    return { ...item, status: ReviewStatus.Exists, selected: false };
  }
  if (!item.unit) {
    return {
      ...item,
      status: ReviewStatus.Unresolved,
      selected: false,
      unresolvedReason: 'No unit of measure — add a Unit column to your spreadsheet',
    };
  }
  if (willExistCatLower.has(item.categoryName.toLowerCase())) {
    return { ...item, status: ReviewStatus.New, selected: true };
  }
  return {
    ...item,
    status: ReviewStatus.Unresolved,
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
      status: exists ? ReviewStatus.Exists : ReviewStatus.New,
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
      status: exists ? ReviewStatus.Exists : ReviewStatus.New,
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
      units.filter((u) => u.status === ReviewStatus.New).length +
      categories.filter((c) => c.status === ReviewStatus.New).length +
      items.filter((i) => i.status === ReviewStatus.New).length,
    existsTotal:
      units.filter((u) => u.status === ReviewStatus.Exists).length +
      categories.filter((c) => c.status === ReviewStatus.Exists).length +
      items.filter((i) => i.status === ReviewStatus.Exists).length,
    unresolvedTotal: items.filter((i) => i.status === ReviewStatus.Unresolved).length,
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
