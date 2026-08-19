import { Button, Input } from '@reyogo/ui';
import type { AddUnitFormProps } from './types';

export function AddUnitForm({ value, onChange, onSubmit }: AddUnitFormProps) {
  return (
    <div className="flex gap-2 px-4 py-3">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="New unit name"
        className="h-8 text-sm"
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSubmit();
        }}
      />
      <Button size="sm" onClick={onSubmit} disabled={!value.trim()}>
        Add
      </Button>
    </div>
  );
}
