import { DatePicker, cn } from '@reyogo/ui';
import { FieldLabel } from '../FieldLabel';
import { FIELD_GROUP_CLASS } from '../../constants';
import type { DateFieldProps } from './types';

export function DateField({ value, onChange, needsReview }: DateFieldProps) {
  return (
    <div className={FIELD_GROUP_CLASS}>
      <FieldLabel
        label="Date"
        reviewMessage={needsReview ? 'Claude wasn’t confident reading the invoice date' : undefined}
      />
      <DatePicker
        value={value}
        onChange={onChange}
        className={cn(needsReview && 'ring-1 ring-amber-500 ring-offset-1 rounded-md')}
      />
    </div>
  );
}
