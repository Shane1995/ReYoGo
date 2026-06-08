import { TableCell, cn } from '@reyogo/ui';
import { inputClass } from '../../../utils/inputClass';
import { handleFieldKeyDown, type FieldKeyDownContext } from '../handleFieldKeyDown';

const FIELD_CONFIG = {
  qty: { width: 'w-20', step: 1, placeholder: '0' },
  total: { width: 'w-28', step: 1, placeholder: '0.00' },
} as const;

export function LineNumberCell({
  field,
  lineId,
  value,
  onChange,
  onBlur,
  keyDownCtx,
}: {
  field: 'qty' | 'total';
  lineId: string;
  value: number;
  onChange: (value: number) => void;
  onBlur: (e: React.FocusEvent) => void;
  keyDownCtx: Omit<FieldKeyDownContext, 'field'>;
}) {
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
