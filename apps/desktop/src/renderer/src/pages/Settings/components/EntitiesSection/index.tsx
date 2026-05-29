import { useState } from 'react';
import { Button, Input } from '@reyogo/ui';
import type { IEntity } from '@reyogo/types';
import { entitiesService } from '@/services/entities';

interface EntitiesSectionProps {
  entities: IEntity[];
  onSaved: () => Promise<void>;
}

function EntityRow({ entity, onSaved }: { entity: IEntity; onSaved: () => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(entity.name);
  const [saving, setSaving] = useState(false);
  const initial = entity.name[0]?.toUpperCase() ?? '?';

  const handleRename = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await entitiesService.renameEntity(entity.id, name.trim());
      await onSaved();
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        <div className="size-7 rounded-md bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
          {initial}
        </div>
        {editing ? (
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-7 text-sm"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
          />
        ) : (
          <span className="text-sm font-medium text-foreground">{entity.name}</span>
        )}
      </div>
      {editing ? (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleRename} disabled={saving}>
            Save
          </Button>
        </div>
      ) : (
        <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
          Rename
        </Button>
      )}
    </div>
  );
}

export function EntitiesSection({ entities, onSaved }: EntitiesSectionProps) {
  const [addingName, setAddingName] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!addingName.trim()) return;
    setAdding(true);
    try {
      await entitiesService.createEntity(addingName.trim());
      await onSaved();
      setAddingName('');
      setShowAdd(false);
    } finally {
      setAdding(false);
    }
  };

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Entities
      </h2>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {entities.map((e) => (
          <EntityRow key={e.id} entity={e} onSaved={onSaved} />
        ))}
        <div className="px-4 py-3">
          {showAdd ? (
            <div className="flex gap-2">
              <Input
                value={addingName}
                onChange={(ev) => setAddingName(ev.target.value)}
                placeholder="New entity name"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
              <Button size="sm" onClick={handleAdd} disabled={adding}>
                Add
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setShowAdd(true)}
              className="w-full text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg py-2 hover:text-foreground transition-colors"
              aria-label="Add entity"
            >
              + Add entity
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
