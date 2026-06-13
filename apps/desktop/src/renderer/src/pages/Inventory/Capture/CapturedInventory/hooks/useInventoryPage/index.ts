import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemTrendPath, StockRoutes } from '@/components/AppRoutes/routePaths';
import { useEntities } from '@/Context/EntityContext';
import { useInventory } from '../../Context/InventoryContext';
import { useItemFilters } from '../../components/ItemsTable/hooks/useItemFilters';
import type { InventoryItem } from '../../types';
import { useInventoryCosts } from '../useInventoryCosts';
import { useItemStock } from '../useItemStock';

export function useInventoryPage() {
  const { categories, items, unitOptions, updateItem, archiveItemInBackend, inventoryTypes } =
    useInventory();
  const { selectedEntityId } = useEntities();
  const navigate = useNavigate();
  const costMap = useInventoryCosts();
  const stockMap = useItemStock();

  const entityFilteredItems = useMemo(
    () => (selectedEntityId ? items.filter((item) => item.entityId === selectedEntityId) : items),
    [items, selectedEntityId],
  );

  const { filterValues, filteredItems, filters, allTypes, handleFilterChange, clearFilters } =
    useItemFilters({ items: entityFilteredItems, categories, costMap, stockMap, inventoryTypes });

  const handleViewInsights = useCallback(
    (itemId: string) => navigate(itemTrendPath(itemId)),
    [navigate],
  );

  const handleImport = useCallback(() => navigate(StockRoutes.Import), [navigate]);

  const handleUpdate = useCallback(
    (id: string, values: Omit<InventoryItem, 'id'>) => updateItem(id, values),
    [updateItem],
  );

  return {
    categories,
    unitOptions,
    archiveItemInBackend,
    entityFilteredItems,
    filteredItems,
    allTypes,
    filterValues,
    filters,
    handleFilterChange,
    clearFilters,
    handleViewInsights,
    handleImport,
    handleUpdate,
  };
}
