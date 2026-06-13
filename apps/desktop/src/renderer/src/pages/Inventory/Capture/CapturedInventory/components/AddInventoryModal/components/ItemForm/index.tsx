import { useState } from 'react';
import { Button } from '@reyogo/ui';
import { useEntities } from '@/Context/EntityContext';
import { useInventory } from '../../../../Context/InventoryContext';
import { NameField, UnitOfMeasureField } from '../../../SharedFormFields';
import { itemSavePayload } from '../../utils/itemSavePayload';
import { CategorySelect } from './components/CategorySelect';
import type { ItemFormProps } from './types';

export function ItemForm({ onDone }: ItemFormProps) {
  const { categories, unitOptions, addItem, inventoryTypes } = useInventory();
  const { selectedEntityId: entityId } = useEntities();
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [unitOfMeasureId, setUnitOfMeasureId] = useState('');

  const category = categories.find((c) => c.id === categoryId);

  function handleSave() {
    const payload = itemSavePayload(name.trim(), categoryId, category, unitOfMeasureId, entityId);
    if (!payload) return;
    addItem(payload);
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
