import type { ItemNameFieldProps } from './types';

export function ItemNameField({ nameRef, value, onChange }: ItemNameFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Item name
      </label>
      <input
        ref={nameRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Chicken breast"
        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
        required
      />
    </div>
  );
}
