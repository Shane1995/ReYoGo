import { useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@reyogo/ui';
import type { IEntity } from '@reyogo/types';
import { entitiesService } from '@/services/entities';
import { ipcErrorMessage } from '@/utils/ipcErrorMessage';
import { SectionHeader } from '../SectionHeader';

interface EntitiesSectionProps {
  entities: IEntity[];
  onSaved: () => Promise<void>;
}

const AVATAR_COLORS = [
  { bg: 'rgba(32,201,151,0.12)', fg: '#0D6E4F' },
  { bg: 'rgba(14,165,233,0.12)', fg: '#0369A1' },
  { bg: 'rgba(253,126,20,0.12)', fg: '#9A3412' },
  { bg: 'rgba(168,85,247,0.12)', fg: '#6B21A8' },
  { bg: 'rgba(236,72,153,0.12)', fg: '#9D174D' },
];

const FALLBACK_COLOR = AVATAR_COLORS[0] as (typeof AVATAR_COLORS)[number];

function avatarColor(index: number) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length] ?? FALLBACK_COLOR;
}

function EntityRowActions({
  editing,
  saving,
  name,
  onCancel,
  onSave,
  onStartEdit,
}: {
  editing: boolean;
  saving: boolean;
  name: string;
  onCancel: () => void;
  onSave: () => void;
  onStartEdit: () => void;
}) {
  if (editing) {
    return (
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={onCancel}
          className="h-7 px-2.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={saving || !name.trim()}
          className="h-7 px-2.5 rounded-md text-xs font-semibold bg-primary text-primary-foreground disabled:opacity-40 hover:bg-[var(--primary-hover)] transition-colors"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <button
        onClick={onStartEdit}
        className="h-7 px-2.5 rounded-md text-xs text-muted-foreground border border-transparent hover:border-border hover:text-foreground opacity-0 group-hover:opacity-100 transition-all"
      >
        Rename
      </button>
    </div>
  );
}

function EntityRow({
  entity,
  index,
  onSaved,
}: {
  entity: IEntity;
  index: number;
  onSaved: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(entity.name);
  const [saving, setSaving] = useState(false);
  const color = avatarColor(index);
  const initial = entity.name[0]?.toUpperCase() ?? '?';

  const handleRename = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await entitiesService.renameEntity(entity.id, name.trim());
      await onSaved();
      setEditing(false);
    } catch (err) {
      toast.error(ipcErrorMessage(err, 'Failed to rename the business'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="group flex items-center justify-between gap-3 px-5 py-3.5 border-b border-border last:border-0 hover:bg-accent/40 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="size-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ background: color.bg, color: color.fg }}
        >
          {initial}
        </div>
        {editing ? (
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-7 text-sm w-48"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') setEditing(false);
            }}
          />
        ) : (
          <span className="text-sm font-medium text-foreground truncate">{entity.name}</span>
        )}
      </div>
      <EntityRowActions
        editing={editing}
        saving={saving}
        name={name}
        onCancel={() => setEditing(false)}
        onSave={handleRename}
        onStartEdit={() => setEditing(true)}
      />
    </div>
  );
}

function AddEntityForm({ onSaved }: { onSaved: () => Promise<void> }) {
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
    } catch (err) {
      toast.error(ipcErrorMessage(err, 'Failed to add the business'));
    } finally {
      setAdding(false);
    }
  };

  if (!showAdd) {
    return (
      <button
        onClick={() => setShowAdd(true)}
        className="w-full text-center text-sm text-muted-foreground border border-dashed border-border rounded-xl py-2 hover:text-primary hover:border-primary/40 transition-colors"
      >
        + Add business
      </button>
    );
  }

  return (
    <div className="flex gap-2">
      <Input
        value={addingName}
        onChange={(ev) => setAddingName(ev.target.value)}
        placeholder="New business name"
        className="h-8 text-sm"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleAdd();
          if (e.key === 'Escape') setShowAdd(false);
        }}
      />
      <button
        onClick={handleAdd}
        disabled={adding || !addingName.trim()}
        className="h-8 px-3 rounded-lg text-xs font-semibold bg-primary text-primary-foreground disabled:opacity-40 hover:bg-[var(--primary-hover)] transition-colors"
      >
        {adding ? 'Adding…' : 'Add'}
      </button>
      <button
        onClick={() => setShowAdd(false)}
        className="h-8 px-3 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}

export function EntitiesSection({ entities, onSaved }: EntitiesSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <SectionHeader label="Entities" />
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {entities.map((e, i) => (
          <EntityRow key={e.id} entity={e} index={i} onSaved={onSaved} />
        ))}
        <div className="px-5 py-3">
          <AddEntityForm onSaved={onSaved} />
        </div>
      </div>
    </section>
  );
}
