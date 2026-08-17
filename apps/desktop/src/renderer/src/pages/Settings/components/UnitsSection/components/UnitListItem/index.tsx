import { useState } from 'react';
import { Badge, Button, Input } from '@reyogo/ui';
import type { UnitListItemProps } from './types';

export function UnitListItem({ unit, onRename, onArchive }: UnitListItemProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(unit.name);

  const handleSave = () => {
    onRename(unit.id, name);
    setEditing(false);
  };

  const handleCancel = () => {
    setName(unit.name);
    setEditing(false);
  };

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-border last:border-0">
      {editing ? (
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-8 text-sm w-48"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
        />
      ) : (
        <span className="text-sm font-medium text-foreground">{unit.name}</span>
      )}
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant="secondary">
          {unit.usageCount} {unit.usageCount === 1 ? 'item' : 'items'}
        </Badge>
        {editing ? (
          <>
            <Button size="sm" variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!name.trim()}>
              Save
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              Rename
            </Button>
            <Button size="sm" variant="outline" onClick={() => onArchive(unit.id)}>
              Archive
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
