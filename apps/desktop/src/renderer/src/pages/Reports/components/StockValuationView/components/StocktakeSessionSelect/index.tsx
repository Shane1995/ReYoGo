import type { StocktakeSessionSelectProps } from './types';

export function StocktakeSessionSelect({ sessions, value, onChange }: StocktakeSessionSelectProps) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value)}
      className="h-9 rounded-md border border-input bg-background px-3 text-sm"
    >
      <option value="">All Stock</option>
      {sessions.map((session) => (
        <option key={session.id} value={session.id}>
          {session.label ?? 'Untitled count'}
        </option>
      ))}
    </select>
  );
}
