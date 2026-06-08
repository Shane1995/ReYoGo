import { cn } from '@reyogo/ui';

export const modalInputClass = cn(
  'h-8 w-full rounded-md border border-input bg-background px-2.5 text-sm',
  'focus:outline-none focus:ring-2 focus:ring-[var(--nav-active-border)]/50 focus:ring-offset-0',
);

type NameFieldProps = {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onSave: () => void;
};

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

type UnitOption = { id: string; name: string };

type UnitOfMeasureFieldProps = {
  value: string;
  unitOptions: UnitOption[];
  onChange: (value: string) => void;
};

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
