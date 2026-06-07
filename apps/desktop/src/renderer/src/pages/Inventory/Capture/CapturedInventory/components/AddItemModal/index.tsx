import { useState, useCallback } from 'react';
import { Button } from '@reyogo/ui';
import type { TypeValue, InventoryCategory, InventoryItem } from '../../types';
import type { UnitOption } from '../ItemsTable/types';
import { cn } from '@reyogo/ui';
import { modalInputClass, NameField, UnitOfMeasureField } from '../formField';

type AddItemModalProps = {
  open: boolean;
  onClose: () => void;
  categories: InventoryCategory[];
  unitOptions: UnitOption[];
  onSave: (item: Omit<InventoryItem, 'id'>) => void;
};

function CategoryField({
  categories,
  categoryId,
  onChange,
}: {
  categories: InventoryCategory[];
  categoryId: string;
  onChange: (id: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">Category</label>
      <select
        value={categoryId}
        onChange={(e) => onChange(e.target.value)}
        className={cn(modalInputClass, 'cursor-pointer')}
      >
        <option value="">Select category</option>
        {categories
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((c) => (
            <option key={c.id} value={c.id}>
              {c.type} → {c.name}
            </option>
          ))}
      </select>
    </div>
  );
}

function ModalForm({
  name,
  categoryId,
  unitOfMeasureId,
  categories,
  unitOptions,
  onNameChange,
  onCategoryChange,
  onUomChange,
  onSave,
  onClose,
}: {
  name: string;
  categoryId: string;
  unitOfMeasureId: string;
  categories: InventoryCategory[];
  unitOptions: UnitOption[];
  onNameChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onUomChange: (v: string) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <div className="mt-4 space-y-4">
      <NameField value={name} placeholder="Item name" onChange={onNameChange} onSave={onSave} />
      <CategoryField categories={categories} categoryId={categoryId} onChange={onCategoryChange} />
      <UnitOfMeasureField
        value={unitOfMeasureId}
        unitOptions={unitOptions}
        onChange={onUomChange}
      />
      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="success"
          onClick={onSave}
          disabled={!name.trim() || !categoryId}
        >
          Save
        </Button>
      </div>
    </div>
  );
}

export function AddItemModal({
  open,
  onClose,
  categories,
  unitOptions,
  onSave,
}: AddItemModalProps) {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [unitOfMeasureId, setUnitOfMeasureId] = useState('');

  const category = categories.find((c) => c.id === categoryId);
  const type: TypeValue = category?.type ?? '';

  const reset = useCallback(() => {
    setName('');
    setCategoryId('');
    setUnitOfMeasureId('');
  }, []);

  const handleSave = useCallback(() => {
    const trimmed = name.trim();
    if (!trimmed || !categoryId) return;
    onSave({ name: trimmed, categoryId, type, unitOfMeasureId: unitOfMeasureId || null });
    reset();
    onClose();
  }, [name, categoryId, type, unitOfMeasureId, onSave, onClose, reset]);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-[var(--nav-border)] bg-background shadow-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-foreground">Add item</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a new item to inventory. It will appear in the item dropdown.
        </p>
        <ModalForm
          name={name}
          categoryId={categoryId}
          unitOfMeasureId={unitOfMeasureId}
          categories={categories}
          unitOptions={unitOptions}
          onNameChange={setName}
          onCategoryChange={setCategoryId}
          onUomChange={setUnitOfMeasureId}
          onSave={handleSave}
          onClose={handleClose}
        />
      </div>
    </div>
  );
}
