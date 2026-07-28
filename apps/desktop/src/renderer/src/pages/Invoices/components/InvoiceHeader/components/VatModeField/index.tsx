import { cn } from '@reyogo/ui';
import { VatMode } from '@reyogo/types';
import { inputClass } from '../../../../utils/inputClass';
import { FIELD_GROUP_CLASS, FIELD_LABEL_CLASS } from '../../constants';
import type { VatModeFieldProps } from './types';

function parseVatMode(value: string): VatMode | null {
  if (value === VatMode.Exclusive || value === VatMode.Inclusive) return value;
  return null;
}

export function VatModeField({ value, onChange }: VatModeFieldProps) {
  return (
    <div className={FIELD_GROUP_CLASS}>
      <label className={FIELD_LABEL_CLASS}>VAT treatment</label>
      <select
        value={value}
        onChange={(e) => {
          const mode = parseVatMode(e.target.value);
          if (mode) onChange(mode);
        }}
        className={cn(inputClass, 'w-40')}
      >
        <option value={VatMode.Exclusive}>+ VAT (exclusive)</option>
        <option value={VatMode.Inclusive}>VAT included</option>
      </select>
    </div>
  );
}
