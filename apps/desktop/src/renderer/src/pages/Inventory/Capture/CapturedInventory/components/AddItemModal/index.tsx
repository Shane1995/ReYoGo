import { useState, useCallback } from 'react';
import type { TypeValue } from '../../types';
import { ModalForm } from './components/ModalForm';
import type { AddItemModalProps } from './types';

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
