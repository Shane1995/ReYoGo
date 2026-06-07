import { useState, useCallback } from 'react';
import { Button } from '@reyogo/ui';
import { INVENTORY_TYPES, InventoryType } from '@reyogo/types';
import { useInventory } from '../../Context/InventoryContext';
import { typeGroupLabel } from '../../utils/typeConfig';
import { useEntities } from '@/Context/EntityContext';
import { cn } from '@reyogo/ui';
import { modalInputClass, NameField, UnitOfMeasureField } from '../formField';

enum Tab {
  ITEM = 'item',
  CATEGORY = 'category',
}

type Props = {
  open: boolean;
  onClose: () => void;
};

function CategoryForm({ onDone }: { onDone: () => void }) {
  const { addCategory } = useInventory();
  const [name, setName] = useState('');
  const [type, setType] = useState(InventoryType.Food);

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed || !type) return;
    addCategory({ name: trimmed, type });
    setName('');
    onDone();
  }

  return (
    <div className="space-y-4">
      <NameField value={name} placeholder="Category name" onChange={setName} onSave={handleSave} />
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as InventoryType)}
          className={cn(modalInputClass, 'cursor-pointer')}
        >
          {INVENTORY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" onClick={handleSave} disabled={!name.trim() || !type}>
          Add category
        </Button>
      </div>
    </div>
  );
}

function CategorySelect({
  categories,
  inventoryTypes,
  value,
  onChange,
}: {
  categories: ReturnType<typeof useInventory>['categories'];
  inventoryTypes: ReturnType<typeof useInventory>['inventoryTypes'];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">Category</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(modalInputClass, 'cursor-pointer')}
      >
        <option value="">Select category…</option>
        {inventoryTypes
          .filter((t) => categories.some((c) => c.type === t))
          .map((type) => (
            <optgroup key={type} label={typeGroupLabel(type)}>
              {categories
                .filter((c) => c.name.trim() && c.type === type)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </optgroup>
          ))}
      </select>
    </div>
  );
}

function ItemForm({ onDone }: { onDone: () => void }) {
  const { categories, unitOptions, addItem, inventoryTypes } = useInventory();
  const { selectedEntityId: entityId } = useEntities();
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [unitOfMeasureId, setUnitOfMeasureId] = useState('');

  const category = categories.find((c) => c.id === categoryId);

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed || !categoryId || !category || !entityId) return;
    addItem({
      name: trimmed,
      categoryId,
      type: category.type,
      unitOfMeasureId: unitOfMeasureId || null,
      entityId,
    });
    setName('');
    setCategoryId('');
    setUnitOfMeasureId('');
    onDone();
  }

  return (
    <div className="space-y-4">
      <NameField value={name} placeholder="Item name" onChange={setName} onSave={handleSave} />
      <CategorySelect
        categories={categories}
        inventoryTypes={inventoryTypes}
        value={categoryId}
        onChange={setCategoryId}
      />
      <UnitOfMeasureField
        value={unitOfMeasureId}
        unitOptions={unitOptions}
        onChange={setUnitOfMeasureId}
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" onClick={handleSave} disabled={!name.trim() || !categoryId}>
          Add item
        </Button>
      </div>
    </div>
  );
}

const TABS: { id: Tab; label: string }[] = [
  { id: Tab.ITEM, label: Tab.ITEM },
  { id: Tab.CATEGORY, label: Tab.CATEGORY },
];

function ModalTabBar({ activeTab, onSelect }: { activeTab: Tab; onSelect: (t: Tab) => void }) {
  return (
    <div className="flex items-center justify-between border-b border-border px-6 pt-5 pb-0">
      <h2 className="text-base font-semibold text-foreground">Add to inventory</h2>
      <div className="flex gap-0.5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelect(tab.id)}
            className={cn(
              'rounded-t-md px-3.5 py-2 text-xs font-medium transition-colors',
              activeTab === tab.id
                ? 'border-b-2 border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AddInventoryModal({ open, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.ITEM);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleDone = useCallback((label: string) => {
    setSuccessMsg(`${label} added`);
    setTimeout(() => setSuccessMsg(null), 2000);
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-[var(--nav-border)] bg-background shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalTabBar activeTab={activeTab} onSelect={setActiveTab} />
        <div className="px-6 py-5">
          {successMsg && (
            <div className="mb-4 rounded-md bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
              {successMsg}
            </div>
          )}
          {activeTab === Tab.ITEM && <ItemForm onDone={() => handleDone(Tab.ITEM)} />}
          {activeTab === Tab.CATEGORY && <CategoryForm onDone={() => handleDone(Tab.CATEGORY)} />}
        </div>
        <div className="flex justify-end border-t border-border px-6 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
