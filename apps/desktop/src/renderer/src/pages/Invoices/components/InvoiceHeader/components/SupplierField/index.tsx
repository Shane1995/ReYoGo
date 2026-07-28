import { cn } from '@reyogo/ui';
import { inputClass } from '../../../../utils/inputClass';
import { FieldLabel } from '../FieldLabel';
import { FIELD_GROUP_CLASS } from '../../constants';
import type { SupplierFieldProps } from './types';

export function SupplierField({ value, onChange, suppliers, needsReview }: SupplierFieldProps) {
  return (
    <div className={FIELD_GROUP_CLASS}>
      <FieldLabel
        label="Supplier"
        reviewMessage={
          needsReview ? 'Claude couldn’t confidently match this supplier — please check' : undefined
        }
      />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(inputClass, 'w-44', needsReview && 'ring-1 ring-amber-500 ring-offset-1')}
      >
        <option value="">— none —</option>
        {suppliers.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
    </div>
  );
}
