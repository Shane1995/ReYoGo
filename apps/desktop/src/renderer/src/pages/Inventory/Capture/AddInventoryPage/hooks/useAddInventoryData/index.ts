import { useInventory } from '../../../CapturedInventory/Context/InventoryContext';
import { useEntities } from '@/Context/EntityContext';
import { useItemRows } from '../useItemRows';
import { useCategoryRows } from '../useCategoryRows';

export function useAddInventoryData() {
  const { categories, items, unitOptions, addItem, addCategory, inventoryTypes } = useInventory();
  const { selectedEntityId: entityId } = useEntities();
  const namedCategories = categories
    .filter((c) => c.name.trim())
    .sort((a, b) => a.name.localeCompare(b.name));
  const categoryTypes = inventoryTypes.filter((t) => namedCategories.some((c) => c.type === t));
  const items_ = useItemRows({ items, entityId, addItem });
  const cats_ = useCategoryRows({ categories, addCategory });
  return { namedCategories, categoryTypes, unitOptions, items_, cats_ };
}
