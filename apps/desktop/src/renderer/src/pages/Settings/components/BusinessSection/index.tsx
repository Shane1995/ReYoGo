import { useState } from 'react';
import { Input } from '@reyogo/ui';
import type { IBusinessGroup } from '@reyogo/types';
import { entitiesService } from '@/services/entities';
import { SectionHeader } from '../SectionHeader';

interface BusinessSectionProps {
  group: IBusinessGroup | null;
  onSaved: () => Promise<void>;
}

export function BusinessSection({ group, onSaved }: BusinessSectionProps) {
  const [name, setName] = useState(group?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !group) return;
    setSaving(true);
    try {
      await entitiesService.updateGroupName(name.trim());
      await onSaved();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="flex flex-col gap-3">
      <SectionHeader label="Business" />
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">Business group name</span>
            <span className="text-xs text-muted-foreground">
              The umbrella name shown across the app
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="w-44 text-sm h-8"
            />
            <button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="h-8 px-3 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: saved ? 'var(--primary)' : 'var(--primary)',
                color: 'var(--primary-foreground)',
                opacity: saving || !name.trim() ? 0.4 : 1,
              }}
            >
              {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
