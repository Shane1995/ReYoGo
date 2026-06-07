import { useCallback, useMemo } from 'react';
import { PlusIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, PageHeader } from '@reyogo/ui';
import { itemTrendPath } from '@/components/AppRoutes/routePaths';
import { FilterBar } from '@/components/DataTable';
import { useEntities } from '@/Context/EntityContext';
import { useInventory } from './Context/InventoryContext';
import { ItemsTable } from './components/ItemsTable';
import { AddInventoryModal } from './components/AddInventoryModal';
import { useInventoryCosts } from './hooks/useInventoryCosts';
import { useItemStock } from './hooks/useItemStock/index';
import { useItemFilters } from './components/ItemsTable/hooks/useItemFilters';
import type { InventoryItem } from './types';
import { useState } from 'react';

export default function InventoryIndex() {
  const { categories, items, unitOptions, updateItem, archiveItemInBackend } = useInventory();
  const { selectedEntityId } = useEntities();

  const navigate = useNavigate();
  const costMap = useInventoryCosts();
  const stockMap = useItemStock();
  const [addModalOpen, setAddModalOpen] = useState(false);

  const entityFilteredItems = useMemo(
    () => (selectedEntityId ? items.filter((item) => item.entityId === selectedEntityId) : items),
    [items, selectedEntityId],
  );

  const { filterValues, filteredItems, filters, allTypes, handleFilterChange, clearFilters } =
    useItemFilters({ items: entityFilteredItems, categories, costMap, stockMap });

  const handleViewInsights = useCallback(
    (itemId: string) => navigate(itemTrendPath(itemId)),
    [navigate],
  );

  const handleUpdate = useCallback(
    (id: string, values: Omit<InventoryItem, 'id'>) => updateItem(id, values),
    [updateItem],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title="Captured Inventory"
        actions={
          <Button size="sm" variant="outline" onClick={() => setAddModalOpen(true)}>
            <PlusIcon className="size-3.5" />
            Add
          </Button>
        }
      >
        <FilterBar
          filters={filters}
          values={filterValues}
          onChange={handleFilterChange}
          onClearAll={clearFilters}
        />
      </PageHeader>

      <div className="min-h-0 flex-1 overflow-auto">
        <div className="mx-4 my-4">
          <ItemsTable
            items={entityFilteredItems}
            filteredItems={filteredItems}
            allTypes={allTypes}
            categories={categories}
            unitOptions={unitOptions}
            onUpdate={handleUpdate}
            onDelete={archiveItemInBackend}
            onViewInsights={handleViewInsights}
          />
        </div>
      </div>

      <AnimatePresence>
        {!addModalOpen && (
          <motion.button
            type="button"
            title="Add to inventory"
            onClick={() => setAddModalOpen(true)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="fixed bottom-6 right-6 z-40 flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-[var(--primary-hover)] transition-colors"
          >
            <PlusIcon className="size-4" />
          </motion.button>
        )}
      </AnimatePresence>

      <AddInventoryModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </div>
  );
}
