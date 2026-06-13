import { ReviewStatus } from '@/components/CsvImport/review';
import type {
  ReviewResult,
  ReviewUnit,
  ReviewCategory,
  ExistingInventory,
  InventoryType,
} from '@/components/CsvImport/review';
import type { InventoryCategory, InventoryItem } from '../../types';

export async function loadExistingInventory(
  existingCats: InventoryCategory[],
  existingItems: InventoryItem[],
): Promise<ExistingInventory> {
  const units = (await window.electronAPI.ipcRenderer.invoke('setup:get-units')) as {
    name: string;
  }[];
  return {
    categoryNames: new Set(existingCats.map((c) => c.name.toLowerCase())),
    itemNames: new Set(existingItems.map((i) => i.name.toLowerCase())),
    unitNames: new Set(units.map((u) => u.name.toLowerCase())),
    categoryList: existingCats.map((c) => ({ name: c.name, type: c.type as InventoryType })),
  };
}

async function upsertNewUnits(units: ReviewUnit[]): Promise<Map<string, string>> {
  const existingUnits = (await window.electronAPI.ipcRenderer.invoke('setup:get-units')) as {
    id: string;
    name: string;
  }[];
  const unitNameToId = new Map<string, string>(
    existingUnits.map((u) => [u.name.toLowerCase(), u.id]),
  );

  for (const u of units.filter((u) => u.selected && u.status === ReviewStatus.New)) {
    const id = crypto.randomUUID();
    await window.electronAPI.ipcRenderer.invoke('setup:upsert-unit', { id, name: u.name });
    unitNameToId.set(u.name.toLowerCase(), id);
  }
  return unitNameToId;
}

function addNewCategories(
  categories: ReviewCategory[],
  existingCats: InventoryCategory[],
  addCategory: (category: { name: string; type: InventoryType }) => string,
): Map<string, string> {
  const catNameToId = new Map<string, string>(
    existingCats.map((c) => [c.name.toLowerCase(), c.id]),
  );
  for (const c of categories.filter((c) => c.selected && c.status !== ReviewStatus.Exists)) {
    const id = addCategory({ name: c.name, type: c.type });
    catNameToId.set(c.name.toLowerCase(), id);
  }
  return catNameToId;
}

function resolveUnitOfMeasureId(
  unit: string | undefined,
  unitNameToId: Map<string, string>,
): string | null {
  if (!unit) return null;
  return unitNameToId.get(unit.toLowerCase()) ?? null;
}

function resolveItemType(cat: { type: string } | undefined): string {
  if (!cat) return 'food';
  return cat.type;
}

function addNewItems(
  items: ReviewResult['items'],
  categories: ReviewCategory[],
  existingCats: InventoryCategory[],
  catNameToId: Map<string, string>,
  unitNameToId: Map<string, string>,
  entityId: string | undefined,
  addItem: (item: Omit<InventoryItem, 'id'>) => string,
): void {
  for (const item of items.filter((i) => i.selected && i.status === ReviewStatus.New)) {
    const catId = catNameToId.get(item.categoryName.toLowerCase());
    if (!catId) continue;
    const cat = [...existingCats, ...categories].find(
      (c) => c.name.toLowerCase() === item.categoryName.toLowerCase(),
    );
    addItem({
      name: item.name,
      categoryId: catId,
      type: resolveItemType(cat),
      unitOfMeasureId: resolveUnitOfMeasureId(item.unit, unitNameToId),
      unitOfMeasure: item.unit,
      entityId,
    });
  }
}

export async function commitReview(
  review: ReviewResult,
  existingCats: InventoryCategory[],
  entityId: string | undefined,
  addCategory: (category: { name: string; type: InventoryType }) => string,
  addItem: (item: Omit<InventoryItem, 'id'>) => string,
): Promise<void> {
  const unitNameToId = await upsertNewUnits(review.units);
  const catNameToId = addNewCategories(review.categories, existingCats, addCategory);
  addNewItems(
    review.items,
    review.categories,
    existingCats,
    catNameToId,
    unitNameToId,
    entityId,
    addItem,
  );
}
