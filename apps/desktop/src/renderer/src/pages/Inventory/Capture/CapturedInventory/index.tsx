import { useCallback, useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, PageHeader } from '@reyogo/ui';
import { itemTrendPath } from '@/components/AppRoutes/routePaths';
import { useInventory } from './Context/InventoryContext';
import { ItemsTable } from './components/ItemsTable';
import { AddInventoryModal } from './components/AddInventoryModal';
import { useInventoryCosts } from './hooks/useInventoryCosts';
import { useItemStock } from './hooks/useItemStock/index';
import type { InventoryItem } from './types';

export default function InventoryIndex() {
  const { categories, items, units, updateItem, deleteItemFromBackend } = useInventory();

  const navigate = useNavigate();
  const costMap = useInventoryCosts();
  const stockMap = useItemStock();
  const [addModalOpen, setAddModalOpen] = useState(false);

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
      />
      <div className="min-h-0 flex-1 overflow-auto">
        <div className="mx-4 my-4">
          <ItemsTable
            items={items}
            categories={categories}
            units={units}
            costMap={costMap}
            stockMap={stockMap}
            onUpdate={handleUpdate}
            onDelete={deleteItemFromBackend}
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
