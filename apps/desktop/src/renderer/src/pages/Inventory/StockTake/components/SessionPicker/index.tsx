import { Button } from '@reyogo/ui';
import type { SessionPickerProps } from './types';

function labelOf(session: SessionPickerProps['sessions'][number]): string {
  return session.label ?? `Untitled (${session.status})`;
}

export function SessionPicker({
  sessions,
  currentSessionId,
  onSelect,
  onCreate,
}: SessionPickerProps) {
  return (
    <div className="flex items-center gap-2">
      <select
        value={currentSessionId ?? ''}
        onChange={(e) => onSelect(e.target.value)}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
      >
        {sessions.map((session) => (
          <option key={session.id} value={session.id}>
            {labelOf(session)}
          </option>
        ))}
      </select>
      <Button size="sm" variant="outline" onClick={onCreate}>
        New Stock Sheet
      </Button>
    </div>
  );
}
