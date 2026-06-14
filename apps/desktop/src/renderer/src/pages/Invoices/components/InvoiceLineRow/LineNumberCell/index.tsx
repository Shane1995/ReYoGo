import { TableCell, cn } from '@reyogo/ui';
import { inputClass } from '../../../utils/inputClass';
import { handleFieldKeyDown } from '../utils/handleFieldKeyDown';
import { FIELD_CONFIG } from './constants';
import type { LineNumberCellProps } from './types';

export function LineNumberCell({
  field,
  lineId,
  value,
  onChange,
  onBlur,
  keyDownCtx,
}: LineNumberCellProps) {
  const { width, step, placeholder } = FIELD_CONFIG[field];
  const inputId = field === 'qty' ? `invoice-qty-${lineId}` : `invoice-total-${lineId}`;

  return (
    <TableCell className="py-2 px-3">
      <input
        id={inputId}
        type="number"
        min={0}
        step={step}
        value={value || ''}
        onChange={(e) => {
          keyDownCtx.setConfirmingDelete(false);
          onChange(e.target.value === '' ? 0 : Number(e.target.value));
        }}
        onKeyDown={(e) => handleFieldKeyDown(e, { ...keyDownCtx, field })}
        onBlur={onBlur}
        className={cn(
          inputClass,
          width,
          'font-mono [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
        )}
        placeholder={placeholder}
      />
    </TableCell>
  );
}
