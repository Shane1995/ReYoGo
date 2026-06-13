import { Button } from '@reyogo/ui';
import { NameField, UnitOfMeasureField } from '../../../SharedFormFields';
import { CategoryField } from '../CategoryField';
import type { ModalFormProps } from './types';

export function ModalForm({
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
}: ModalFormProps) {
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
