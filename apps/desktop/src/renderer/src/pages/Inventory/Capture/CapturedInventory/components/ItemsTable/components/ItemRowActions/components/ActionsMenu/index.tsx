import { PencilIcon, Trash2Icon, LineChartIcon } from 'lucide-react';
import type { ActionsMenuProps } from './types';

export function ActionsMenu({ onEdit, onViewInsights, onArchive }: ActionsMenuProps) {
  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={onEdit}
        className="flex items-center gap-2 rounded px-2 py-1.5 text-sm text-left hover:bg-muted transition-colors"
      >
        <PencilIcon className="size-3.5 text-muted-foreground" />
        Edit
      </button>
      <button
        type="button"
        onClick={onViewInsights}
        className="flex items-center gap-2 rounded px-2 py-1.5 text-sm text-left hover:bg-muted transition-colors"
      >
        <LineChartIcon className="size-3.5 text-muted-foreground" />
        Cost insights
      </button>
      <button
        type="button"
        onClick={onArchive}
        className="flex items-center gap-2 rounded px-2 py-1.5 text-sm text-left text-muted-foreground hover:bg-muted transition-colors"
      >
        <Trash2Icon className="size-3.5" />
        Archive
      </button>
    </div>
  );
}
