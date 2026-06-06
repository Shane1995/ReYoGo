import { useState, useCallback } from 'react';
import { Button } from '@reyogo/ui';
import type { TypeValue, InventoryCategory, InventoryItem } from '../../types';
import type { UnitOption } from '../ItemsTable/types';
import { cn } from '@reyogo/ui';

const inputClass = cn(
  'h-8 w-full rounded-md border border-input bg-background px-2.5 text-sm',
  'focus:outline-none focus:ring-2 focus:ring-[var(--nav-active-border)]/50 focus:ring-offset-0',
);

type AddItemModalProps = {
  open: boolean;
  onClose: () => void;
  categories: InventoryCategory[];
  unitOptions: UnitOption[];
  onSave: (item: Omit<InventoryItem, 'id'>) => void;
};

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

  const handleSave = useCallback(() => {
    const trimmed = name.trim();
    if (!trimmed || !categoryId) return;
    onSave({
      name: trimmed,
      categoryId,
      type,
      unitOfMeasureId: unitOfMeasureId || null,
    });
    setName('');
    setCategoryId('');
    setUnitOfMeasureId('');
    onClose();
  }, [name, categoryId, type, unitOfMeasureId, onSave, onClose]);

  const handleClose = useCallback(() => {
    setName('');
    setCategoryId('');
    setUnitOfMeasureId('');
    onClose();
  }, [onClose]);

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
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className={inputClass}
              placeholder="Item name"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={cn(inputClass, 'cursor-pointer')}
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
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Unit of measure
            </label>
            <select
              value={unitOfMeasureId}
              onChange={(e) => setUnitOfMeasureId(e.target.value)}
              className={cn(inputClass, 'cursor-pointer')}
            >
              <option value="">— none —</option>
              {unitOptions.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="success"
            onClick={handleSave}
            disabled={!name.trim() || !categoryId}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
