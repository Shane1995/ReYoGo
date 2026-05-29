import { useState } from 'react';
import { Input } from '@reyogo/ui';
import type { IBusinessGroup } from '@reyogo/types';
import { entitiesService } from '@/services/entities';
import { getGroupLogo, setGroupLogo, clearGroupLogo, pickImageFile } from '@/utils/logoStorage';
import { SectionHeader } from '../SectionHeader';

interface BusinessSectionProps {
  group: IBusinessGroup | null;
  onSaved: () => Promise<void>;
}

export function BusinessSection({ group, onSaved }: BusinessSectionProps) {
  const [name, setName] = useState(group?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logo, setLogo] = useState<string | null>(() => getGroupLogo());

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

  const handleLogoClick = async () => {
    const dataUrl = await pickImageFile();
    if (!dataUrl) return;
    setGroupLogo(dataUrl);
    setLogo(dataUrl);
  };

  const handleLogoClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearGroupLogo();
    setLogo(null);
  };

  return (
    <section className="flex flex-col gap-3">
      <SectionHeader label="Business" />
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="relative group/logo">
              <button
                onClick={handleLogoClick}
                className="size-10 rounded-xl overflow-hidden flex items-center justify-center border border-border hover:border-primary/40 transition-colors"
                title="Upload logo"
              >
                {logo ? (
                  <img src={logo} alt="Group logo" className="size-full object-cover" />
                ) : (
                  <div className="size-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {(group?.name?.[0] ?? 'B').toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/logo:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 10.5L5 7.5L7.5 10L10 6.5L12 10.5H2Z" fill="white" opacity="0.9" />
                    <circle cx="4.5" cy="4.5" r="1.5" fill="white" opacity="0.9" />
                  </svg>
                </div>
              </button>
              {logo && (
                <button
                  onClick={handleLogoClear}
                  className="absolute -top-1.5 -right-1.5 size-4 rounded-full bg-destructive text-white text-xs flex items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity"
                  title="Remove logo"
                >
                  ×
                </button>
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">Business group name</span>
              <span className="text-xs text-muted-foreground">
                The umbrella name shown across the app
              </span>
            </div>
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
              className="h-8 px-3 rounded-lg text-xs font-semibold bg-primary text-primary-foreground transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--primary-hover)]"
            >
              {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
