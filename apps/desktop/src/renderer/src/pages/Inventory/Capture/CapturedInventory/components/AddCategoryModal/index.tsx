import { useState, useCallback } from 'react';
import { Button } from '@reyogo/ui';
import { InventoryType } from '@reyogo/types';
import type { TypeValue } from '../../types';
import { CategoryFields } from './components/CategoryFields';
import type { AddCategoryModalProps } from './types';

export function AddCategoryModal({ open, onClose, onSave }: AddCategoryModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<TypeValue>('');

  const handleSave = useCallback(() => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave({ name: trimmed, type: type || InventoryType.Food });
    setName('');
    setType('');
    onClose();
  }, [name, type, onSave, onClose]);

  const handleClose = useCallback(() => {
    setName('');
    setType('');
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
        <h2 className="text-lg font-semibold text-foreground">Add category</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a new category to use in the item dropdown.
        </p>
        <CategoryFields
          name={name}
          type={type}
          onNameChange={setName}
          onTypeChange={setType}
          onSave={handleSave}
        />
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={!name.trim()}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
