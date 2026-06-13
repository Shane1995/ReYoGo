import type { InventoryCategory } from '../../../../types';
import type { UnitOption } from '../../../ItemsTable/types';

export type ModalFormProps = {
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
};
