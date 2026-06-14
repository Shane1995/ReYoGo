import type { FieldKeyDownContext } from '../utils/handleFieldKeyDown';

export type LineNumberCellProps = {
  field: 'qty' | 'total';
  lineId: string;
  value: number;
  onChange: (value: number) => void;
  onBlur: (e: React.FocusEvent) => void;
  keyDownCtx: Omit<FieldKeyDownContext, 'field'>;
};
