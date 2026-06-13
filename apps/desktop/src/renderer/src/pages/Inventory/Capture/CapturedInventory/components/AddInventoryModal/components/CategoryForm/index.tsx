import { useState } from 'react';
import { Button, cn } from '@reyogo/ui';
import { INVENTORY_TYPES, InventoryType } from '@reyogo/types';
import { useInventory } from '../../../../Context/InventoryContext';
import { NameField, modalInputClass } from '../../../SharedFormFields';
import type { TypeValue } from '../../../../types';
import type { CategoryFormProps } from './types';

export function CategoryForm({ onDone }: CategoryFormProps) {
  const { addCategory } = useInventory();
  const [name, setName] = useState('');
  const [type, setType] = useState<TypeValue>(InventoryType.Food);

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
          onChange={(e) => setType(e.target.value)}
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
