import type { FormEvent } from 'react';
import { Button } from '@reyogo/ui';
import { CategorySelect } from './components/CategorySelect';
import { DialogHeader } from './components/DialogHeader';
import { ItemNameField } from './components/ItemNameField';
import { UomSelect } from './components/UomSelect';
import { useItemDialogState } from './hooks/useItemDialogState';
import type { EditItemDialogProps } from './types';
import { itemIdOf } from './utils/itemIdOf';
import { saveValuesOf } from './utils/saveValuesOf';

export function EditItemDialog({
  item,
  categories,
  unitOptions,
  onSave,
  onClose,
}: EditItemDialogProps) {
  const { name, setName, categoryId, setCategoryId, unitOfMeasureId, setUnitOfMeasureId, nameRef } =
    useItemDialogState(item);
  const namedCategories = categories.filter((c) => c.name.trim());
  const selectedCategory = namedCategories.find((c) => c.id === categoryId);
  const types = Array.from(new Set(namedCategories.map((c) => c.type)));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId) return;
    onSave(itemIdOf(item), saveValuesOf(name, categoryId, selectedCategory, unitOfMeasureId));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-background shadow-xl">
        <DialogHeader isEdit={!!item} onClose={onClose} />
        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          <ItemNameField nameRef={nameRef} value={name} onChange={setName} />
          <CategorySelect
            categoryId={categoryId}
            namedCategories={namedCategories}
            types={types}
            selectedCategory={selectedCategory}
            onChange={setCategoryId}
          />
          <UomSelect
            value={unitOfMeasureId}
            unitOptions={unitOptions}
            onChange={setUnitOfMeasureId}
          />
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!name.trim() || !categoryId}>
              {item ? 'Save changes' : 'Add item'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
