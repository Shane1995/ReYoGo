import { useState } from 'react';
import { Button, Input } from '@reyogo/ui';
import type { IEntity, VatMode } from '@reyogo/types';
import { entitiesService } from '@/services/entities';

interface TaxSectionProps {
  entities: IEntity[];
  onSaved: () => Promise<void>;
}

function EntityTaxRow({ entity, onSaved }: { entity: IEntity; onSaved: () => Promise<void> }) {
  const [vatRate, setVatRate] = useState(String(entity.defaultVatRate));
  const [vatMode, setVatMode] = useState<VatMode>(entity.defaultVatMode);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const rate = parseFloat(vatRate);
    if (isNaN(rate)) return;
    setSaving(true);
    try {
      await entitiesService.updateEntityVat(entity.id, rate, vatMode);
      await onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border last:border-0">
      <span className="text-sm font-medium text-foreground w-32 flex-shrink-0">{entity.name}</span>
      <div className="flex items-center gap-3 flex-1">
        <select
          value={vatMode}
          onChange={(e) => setVatMode(e.target.value as VatMode)}
          className="text-sm bg-input border border-border rounded-md px-2 py-1.5 text-foreground"
        >
          <option value="exclusive">Exclusive</option>
          <option value="inclusive">Inclusive</option>
        </select>
        <div className="flex items-center gap-1">
          <Input
            value={vatRate}
            onChange={(e) => setVatRate(e.target.value)}
            className="w-16 text-right"
          />
          <span className="text-sm text-muted-foreground">%</span>
        </div>
      </div>
      <Button size="sm" onClick={handleSave} disabled={saving}>
        Save
      </Button>
    </div>
  );
}

export function TaxSection({ entities, onSaved }: TaxSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Tax</h2>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {entities.map((e) => (
          <EntityTaxRow key={e.id} entity={e} onSaved={onSaved} />
        ))}
      </div>
    </section>
  );
}
