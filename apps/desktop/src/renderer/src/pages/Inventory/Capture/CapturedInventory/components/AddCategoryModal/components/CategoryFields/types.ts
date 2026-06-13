import type { TypeValue } from '../../../../types';

export type CategoryFieldsProps = {
  name: string;
  type: TypeValue;
  onNameChange: (v: string) => void;
  onTypeChange: (v: TypeValue) => void;
  onSave: () => void;
};
