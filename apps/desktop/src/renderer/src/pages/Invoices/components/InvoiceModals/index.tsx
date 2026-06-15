import { AddCategoryModal } from '@/pages/Inventory/Capture/CapturedInventory/components/AddCategoryModal';
import { AddItemModal } from '@/pages/Inventory/Capture/CapturedInventory/components/AddItemModal';
import type { InvoiceModalsProps } from './types';

export function InvoiceModals({
  categoryModalOpen,
  itemModalOpen,
  categories,
  unitOptions,
  onCloseCategory,
  onCloseItem,
  onSaveCategory,
  onSaveItem,
}: InvoiceModalsProps) {
  return (
    <>
      <AddCategoryModal
        open={categoryModalOpen}
        onClose={onCloseCategory}
        onSave={onSaveCategory}
      />
      <AddItemModal
        open={itemModalOpen}
        onClose={onCloseItem}
        categories={categories}
        unitOptions={unitOptions}
        onSave={onSaveItem}
      />
    </>
  );
}
