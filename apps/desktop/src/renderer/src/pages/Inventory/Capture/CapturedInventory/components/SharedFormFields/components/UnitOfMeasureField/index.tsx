import { cn } from '@reyogo/ui';
import { modalInputClass } from '../../constants';
import type { UnitOfMeasureFieldProps } from './types';

export function UnitOfMeasureField({ value, unitOptions, onChange }: UnitOfMeasureFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">Unit of measure</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(modalInputClass, 'cursor-pointer')}
      >
        <option value="">— none —</option>
        {unitOptions.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>
    </div>
  );
}
