import { cn } from '@reyogo/ui';
import { inputClass } from '../../../../utils/inputClass';
import { FieldLabel } from '../FieldLabel';
import { FIELD_GROUP_CLASS } from '../../constants';
import type { InvoiceNumberFieldProps } from './types';

export function InvoiceNumberField({ value, onChange, needsReview }: InvoiceNumberFieldProps) {
  return (
    <div className={FIELD_GROUP_CLASS}>
      <FieldLabel
        label="Invoice #"
        reviewMessage={
          needsReview ? 'Claude wasn’t confident reading the invoice number' : undefined
        }
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="INV-0042"
        className={cn(
          inputClass,
          'w-52 font-mono text-[13px] placeholder:text-muted-foreground/40',
          needsReview && 'ring-1 ring-amber-500 ring-offset-1',
        )}
      />
    </div>
  );
}
