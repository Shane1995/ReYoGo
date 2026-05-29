import { useState } from 'react';
import type { IEntity, VatMode } from '@reyogo/types';
import { entitiesService } from '@/services/entities';
import { SectionHeader } from '../SectionHeader';

interface TaxSectionProps {
  entities: IEntity[];
  onSaved: () => Promise<void>;
}

function EntityTaxRow({ entity, onSaved }: { entity: IEntity; onSaved: () => Promise<void> }) {
  const [vatRate, setVatRate] = useState(String(entity.defaultVatRate));
  const [vatMode, setVatMode] = useState<VatMode>(entity.defaultVatMode);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    const rate = parseFloat(vatRate);
    if (isNaN(rate)) return;
    setSaving(true);
    try {
      await entitiesService.updateEntityVat(entity.id, rate, vatMode);
      await onSaved();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const inputBase =
    'bg-background border border-border rounded-lg text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20 font-mono';

  return (
    <div className="flex items-center gap-4 px-5 py-3.5 border-b border-border last:border-0">
      <span className="text-sm font-medium text-foreground w-36 shrink-0 truncate">
        {entity.name}
      </span>
      <div className="flex items-center gap-2 flex-1">
        <select
          value={vatMode}
          onChange={(e) => setVatMode(e.target.value as VatMode)}
          className={`${inputBase} px-2.5 py-1.5 cursor-pointer w-32`}
        >
          <option value="exclusive">Exclusive</option>
          <option value="inclusive">Inclusive</option>
        </select>
        <div className="flex items-center gap-1">
          <input
            value={vatRate}
            onChange={(e) => setVatRate(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className={`${inputBase} px-2.5 py-1.5 w-16 text-right`}
          />
          <span className="text-sm text-muted-foreground">%</span>
        </div>
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="h-8 px-3 rounded-lg text-xs font-semibold shrink-0 transition-all disabled:opacity-40"
        style={{
          background: saved ? 'var(--primary)' : 'var(--primary)',
          color: 'var(--primary-foreground)',
        }}
      >
        {saved ? '✓' : saving ? '…' : 'Save'}
      </button>
    </div>
  );
}

export function TaxSection({ entities, onSaved }: TaxSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <SectionHeader label="Tax" />
        <span className="text-xs text-muted-foreground">Per venue VAT defaults</span>
      </div>
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {entities.map((e) => (
          <EntityTaxRow key={e.id} entity={e} onSaved={onSaved} />
        ))}
      </div>
    </section>
  );
}
