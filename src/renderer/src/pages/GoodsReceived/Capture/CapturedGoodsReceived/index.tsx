import { useCallback } from "react";
import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { itemTrendPath } from "@/components/AppRoutes/routePaths";
import { useInventory } from "./Context/InventoryContext";
import { ItemsTable } from "./components/ItemsTable";
import { EditItemDialog } from "./components/EditItemDialog";
import { Button } from "@/components/ui/button";
import { useItemCosts } from "./hooks/useItemCosts";
import type { InventoryItem } from "./types";

export default function InventoryIndex() {
  const {
    categories,
    items,
    units,
    goodTypes,
    addItem,
    updateItem,
    deleteItemFromBackend,
  } = useInventory();

  const navigate = useNavigate();
  const costMap = useItemCosts();
  const [addingItem, setAddingItem] = useState(false);

  const handleViewInsights = useCallback(
    (itemId: string) => navigate(itemTrendPath(itemId)),
    [navigate]
  );

  const handleUpdate = useCallback(
    (id: string, values: Omit<InventoryItem, "id">) => updateItem(id, values),
    [updateItem]
  );

  const handleAdd = useCallback(
    (_id: string | null, values: Omit<InventoryItem, "id">) => {
      addItem({ ...values, unitOfMeasure: values.unitOfMeasure });
      setAddingItem(false);
    },
    [addItem]
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-auto">
        <div className="mx-6 my-5">
          <div className="mb-3 flex justify-end">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs"
              onClick={() => setAddingItem(true)}
            >
              <PlusIcon className="size-3.5" />
              Add item
            </Button>
          </div>
          <ItemsTable
            items={items}
            categories={categories}
            units={units}
            goodTypes={goodTypes}
            costMap={costMap}
            onUpdate={handleUpdate}
            onDelete={deleteItemFromBackend}
            onViewInsights={handleViewInsights}
          />
        </div>
      </div>

      {addingItem && (
        <EditItemDialog
          item={null}
          categories={categories}
          units={units}
          onSave={handleAdd}
          onClose={() => setAddingItem(false)}
        />
      )}
    </div>
  );
}
