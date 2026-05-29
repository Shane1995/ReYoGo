import { useState } from 'react';
import type { IEntity } from '@reyogo/types';
import { entitiesService } from '@/services/entities';
import { SectionHeader } from '../SectionHeader';

interface TaxSectionProps {
  entities: IEntity[];
  onSaved: () => Promise<void>;
}

export function TaxSection({ entities, onSaved }: TaxSectionProps) {
  const currentRate = entities[0]?.defaultVatRate ?? 15;
  const [vatRate, setVatRate] = useState(String(currentRate));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const inputBase =
    'bg-background border border-border rounded-lg text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20 font-mono';

  const handleSave = async () => {
    const rate = parseFloat(vatRate);
    if (isNaN(rate) || rate < 0) return;
    setSaving(true);
    try {
      await Promise.all(
        entities.map((e) => entitiesService.updateEntityVat(e.id, rate, e.defaultVatMode)),
      );
      await onSaved();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="flex flex-col gap-3">
      <SectionHeader label="Tax" />
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center gap-4 px-5 py-4">
          <span className="text-sm text-muted-foreground w-48 shrink-0">VAT rate (all venues)</span>
          <div className="flex items-center gap-1.5">
            <input
              value={vatRate}
              onChange={(e) => setVatRate(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className={`${inputBase} px-2.5 py-1.5 w-16 text-right`}
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-8 px-3 rounded-lg text-xs font-semibold shrink-0 transition-all disabled:opacity-40"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            {saved ? '✓ Saved' : saving ? '…' : 'Save'}
          </button>
        </div>
      </div>
    </section>
  );
}
