import { useState } from 'react';
import { Button, Input } from '@reyogo/ui';
import type { IBusinessGroup } from '@reyogo/types';
import { entitiesService } from '@/services/entities';

interface BusinessSectionProps {
  group: IBusinessGroup | null;
  onSaved: () => Promise<void>;
}

export function BusinessSection({ group, onSaved }: BusinessSectionProps) {
  const [name, setName] = useState(group?.name ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !group) return;
    setSaving(true);
    try {
      await entitiesService.updateGroupName(name.trim());
      await onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Business
      </h2>
      <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-foreground">Business group name</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            The top-level owner of all your entities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-48 text-right"
          />
          <Button size="sm" onClick={handleSave} disabled={saving || !name.trim()}>
            Save
          </Button>
        </div>
      </div>
    </section>
  );
}
