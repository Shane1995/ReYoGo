import { TableCell, cn } from '@reyogo/ui';
import { inputClass } from '../../../utils/inputClass';
import { handleFieldKeyDown } from '../utils/handleFieldKeyDown';
import { FieldReviewIcon } from '../components/FieldReviewIcon';
import { FIELD_CONFIG } from './constants';
import type { LineNumberCellProps } from './types';

function numberInputId(field: 'qty' | 'total', lineId: string): string {
  return field === 'qty' ? `invoice-qty-${lineId}` : `invoice-total-${lineId}`;
}

function numberInputClassName(width: string, needsReview: boolean): string {
  return cn(
    inputClass,
    width,
    'font-mono [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
    needsReview && 'pr-6 ring-1 ring-amber-500 focus-visible:ring-amber-500',
  );
}

export function LineNumberCell({
  field,
  lineId,
  value,
  needsReview = false,
  reviewMessage,
  onChange,
  onBlur,
  keyDownCtx,
}: LineNumberCellProps) {
  const { width, step, placeholder } = FIELD_CONFIG[field];

  return (
    <TableCell className="py-2 px-3">
      <div className="relative">
        <input
          id={numberInputId(field, lineId)}
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
          className={numberInputClassName(width, needsReview)}
          placeholder={placeholder}
        />
        {needsReview && (
          <FieldReviewIcon
            message={reviewMessage ?? 'AI wasn’t confident about this value'}
            className="right-1.5"
          />
        )}
      </div>
    </TableCell>
  );
}
