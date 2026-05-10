import { inventoryService } from '@/services/inventory';
import { setupService } from '@/services/setup';
import type { ExistingInventory } from '../review';

export async function fetchExisting(): Promise<ExistingInventory> {
  const [cats, items, units, goodTypes] = await Promise.all([
    inventoryService.getCategories(),
    inventoryService.getItems(),
    setupService.getUnits(),
    setupService.getGoodTypes(),
  ]);
  return {
    categoryNames: new Set(cats.map((c) => c.name.toLowerCase())),
    itemNames: new Set(items.map((i) => i.name.toLowerCase())),
    unitNames: new Set(units.map((u) => u.name.toLowerCase())),
    categoryList: cats.map((c) => ({ name: c.name, type: c.type })),
    goodTypes,
  };
}
