import { useEffect, useRef, useState } from 'react';
import { XIcon } from 'lucide-react';
import { Button } from '@reyogo/ui';
import { cn } from '@reyogo/ui';
import type { InventoryCategory, InventoryItem } from '../../types';
import type { UnitOption } from '../ItemsTable/types';

type Props = {
  item: InventoryItem | null;
  categories: InventoryCategory[];
  unitOptions: UnitOption[];
  onSave: (id: string | null, values: Omit<InventoryItem, 'id'>) => void;
  onClose: () => void;
};

function CategorySelect({
  categoryId,
  namedCategories,
  types,
  selectedCategory,
  onChange,
}: {
  categoryId: string;
  namedCategories: InventoryCategory[];
  types: string[];
  selectedCategory: InventoryCategory | undefined;
  onChange: (id: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Category
      </label>
      <select
        value={categoryId}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40',
          !categoryId && 'text-muted-foreground',
        )}
        required
      >
        <option value="" disabled>
          Select a category…
        </option>
        {types.map((type) => (
          <optgroup key={type} label={type}>
            {namedCategories
              .filter((c) => c.type === type)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </optgroup>
        ))}
      </select>
      {selectedCategory && (
        <p className="text-xs text-muted-foreground">
          Type: <span className="font-medium text-foreground">{selectedCategory.type}</span>
        </p>
      )}
    </div>
  );
}

function UomSelect({
  value,
  unitOptions,
  onChange,
}: {
  value: string;
  unitOptions: UnitOption[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Unit of measure
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 text-muted-foreground"
      >
        <option value="">None</option>
        {unitOptions.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function ItemNameField({
  nameRef,
  value,
  onChange,
}: {
  nameRef: React.RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Item name
      </label>
      <input
        ref={nameRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Chicken breast"
        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
        required
      />
    </div>
  );
}

function DialogHeader({ isEdit, onClose }: { isEdit: boolean; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between border-b border-border px-5 py-4">
      <h2 className="text-base font-semibold text-foreground">
        {isEdit ? 'Edit item' : 'Add item'}
      </h2>
      <button
        type="button"
        onClick={onClose}
        className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <XIcon className="size-4" />
      </button>
    </div>
  );
}

type ItemFieldDefaults = { name: string; categoryId: string; unitOfMeasureId: string };

function itemFieldDefaults(item: InventoryItem | null): ItemFieldDefaults {
  if (!item) return { name: '', categoryId: '', unitOfMeasureId: '' };
  return {
    name: item.name,
    categoryId: item.categoryId,
    unitOfMeasureId: item.unitOfMeasureId ?? '',
  };
}

function useItemDialogState(item: InventoryItem | null) {
  const defaults = itemFieldDefaults(item);
  const [name, setName] = useState(defaults.name);
  const [categoryId, setCategoryId] = useState(defaults.categoryId);
  const [unitOfMeasureId, setUnitOfMeasureId] = useState(defaults.unitOfMeasureId);
  const nameRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    nameRef.current?.focus();
  }, []);
  return { name, setName, categoryId, setCategoryId, unitOfMeasureId, setUnitOfMeasureId, nameRef };
}

function itemIdOf(item: InventoryItem | null): string | null {
  if (!item) return null;
  return item.id;
}

function saveValuesOf(
  name: string,
  categoryId: string,
  selectedCategory: InventoryCategory | undefined,
  unitOfMeasureId: string,
): Omit<InventoryItem, 'id'> {
  return {
    name: name.trim(),
    categoryId,
    type: selectedCategory?.type ?? '',
    unitOfMeasureId: unitOfMeasureId || null,
  };
}

export function EditItemDialog({ item, categories, unitOptions, onSave, onClose }: Props) {
  const { name, setName, categoryId, setCategoryId, unitOfMeasureId, setUnitOfMeasureId, nameRef } =
    useItemDialogState(item);
  const namedCategories = categories.filter((c) => c.name.trim());
  const selectedCategory = namedCategories.find((c) => c.id === categoryId);
  const types = Array.from(new Set(namedCategories.map((c) => c.type)));

  const handleSubmit = (e: React.FormEvent) => {
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
