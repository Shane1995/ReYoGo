import { useState } from 'react';
import { PlusIcon, UploadIcon } from 'lucide-react';
import { Button, PageHeader } from '@reyogo/ui';
import { FilterBar } from '@/components/DataTable';
import { AddFab } from './components/AddFab';
import { AddInventoryModal } from './components/AddInventoryModal';
import { ItemsTable } from './components/ItemsTable';
import { useInventoryPage } from './hooks/useInventoryPage';

export default function InventoryIndex() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const {
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
  } = useInventoryPage();

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title="Captured Inventory"
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={handleImport}>
              <UploadIcon className="size-3.5" />
              Import
            </Button>
            <Button size="sm" variant="outline" onClick={() => setAddModalOpen(true)}>
              <PlusIcon className="size-3.5" />
              Add
            </Button>
          </div>
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
      <AddFab visible={!addModalOpen} onClick={() => setAddModalOpen(true)} />
      <AddInventoryModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </div>
  );
}
