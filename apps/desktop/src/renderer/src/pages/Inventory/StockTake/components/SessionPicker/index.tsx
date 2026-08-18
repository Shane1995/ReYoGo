import { Button, Badge } from '@reyogo/ui';
import { sessionOptionLabelOf } from './utils/sessionOptionLabelOf';
import { statusBadgeProps } from './utils/statusBadgeProps';
import type { SessionPickerProps } from './types';

export function SessionPicker({
  sessions,
  currentSessionId,
  onSelect,
  onCreate,
}: SessionPickerProps) {
  const currentSession = sessions.find((session) => session.id === currentSessionId);
  const badge = currentSession ? statusBadgeProps(currentSession.status) : null;

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="stock-sheet-select" className="text-sm font-medium text-foreground">
        Stock sheet
      </label>
      <select
        id="stock-sheet-select"
        value={currentSessionId ?? ''}
        onChange={(e) => onSelect(e.target.value)}
        className="h-9 min-w-52 cursor-pointer rounded-md border border-input bg-background px-3 text-sm"
      >
        {sessions.map((session) => (
          <option key={session.id} value={session.id}>
            {sessionOptionLabelOf(session)}
          </option>
        ))}
      </select>
      {badge && <Badge variant={badge.variant}>{badge.label}</Badge>}
      <Button size="sm" variant="outline" className="ml-auto" onClick={onCreate}>
        New Stock Sheet
      </Button>
    </div>
  );
}
