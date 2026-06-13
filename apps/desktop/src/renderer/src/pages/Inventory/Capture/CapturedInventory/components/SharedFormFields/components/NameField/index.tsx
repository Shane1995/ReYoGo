import { modalInputClass } from '../../constants';
import type { NameFieldProps } from './types';

export function NameField({ value, placeholder, onChange, onSave }: NameFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">Name</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSave()}
        className={modalInputClass}
        placeholder={placeholder}
        autoFocus
      />
    </div>
  );
}
