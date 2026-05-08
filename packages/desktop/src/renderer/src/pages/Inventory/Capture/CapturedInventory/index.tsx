import { useCallback, useState } from "react";
import { PlusIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { itemTrendPath } from "@/components/AppRoutes/routePaths";
import { useInventory } from "./Context/InventoryContext";
import { ItemsTable } from "./components/ItemsTable";
import { AddInventoryModal } from "./components/AddInventoryModal";
import { useItemCosts } from "./hooks/useItemCosts";
import { useItemStock } from "./hooks/useItemStock/index";
import { useWeightedAvgCosts } from "./hooks/useWeightedAvgCosts";
import type { InventoryItem } from "./types";

export default function InventoryIndex() {
  const {
    categories,
    items,
    units,
    goodTypes,
    updateItem,
    deleteItemFromBackend,
  } = useInventory();

  const navigate = useNavigate();
  const costMap = useItemCosts();
  const stockMap = useItemStock();
  const weightedAvgMap = useWeightedAvgCosts();
  const [addModalOpen, setAddModalOpen] = useState(false);

  const handleViewInsights = useCallback(
    (itemId: string) => navigate(itemTrendPath(itemId)),
    [navigate]
  );

  const handleUpdate = useCallback(
    (id: string, values: Omit<InventoryItem, "id">) => updateItem(id, values),
    [updateItem]
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-auto">
        <div className="mx-6 my-5 pb-20">
          <ItemsTable
            items={items}
            categories={categories}
            units={units}
            goodTypes={goodTypes}
            costMap={costMap}
            stockMap={stockMap}
            weightedAvgMap={weightedAvgMap}
            onUpdate={handleUpdate}
            onDelete={deleteItemFromBackend}
            onViewInsights={handleViewInsights}
          />
        </div>
      </div>

      <button
        type="button"
        title="Add to inventory"
        onClick={() => setAddModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
      >
        <PlusIcon className="size-5" />
      </button>

      <AddInventoryModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </div>
  );
}
