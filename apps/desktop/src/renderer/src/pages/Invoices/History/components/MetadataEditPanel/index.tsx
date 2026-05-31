import { useState } from 'react';
import { XIcon, CheckIcon } from 'lucide-react';
import { Button } from '@reyogo/ui';
import { cn } from '@reyogo/ui';
import type { ICapturedInvoiceWithLines, Supplier } from '@reyogo/types';
import { inputClass } from '../../../utils/inputClass';

type Props = {
  invoice: ICapturedInvoiceWithLines;
  suppliers: Supplier[];
  onSave: (fields: {
    supplierId: string | null;
    invoiceNumber: string;
    invoiceDate: Date | null;
    note: string;
  }) => Promise<void>;
  onCancel: () => void;
};

function toDateInput(d: Date | string | null | undefined): string {
  if (!d) return '';
  const s = typeof d === 'string' ? d : d.toISOString();
  return s.slice(0, 10);
}

export function MetadataEditPanel({ invoice, suppliers, onSave, onCancel }: Props) {
  const [supplierId, setSupplierId] = useState<string>(invoice.supplierId ?? '');
  const [invoiceNumber, setInvoiceNumber] = useState(invoice.invoiceNumber ?? '');
  const [invoiceDate, setInvoiceDate] = useState(toDateInput(invoice.invoiceDate));
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave({
        supplierId: supplierId || null,
        invoiceNumber: invoiceNumber.trim(),
        invoiceDate: invoiceDate ? new Date(invoiceDate) : null,
        note,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
      setSaving(false);
    }
  };

  const fieldLabel = 'text-xs font-medium text-muted-foreground mb-1 block';

  return (
    <div className="border-t border-[var(--nav-border)] bg-muted/5">
      <div className="px-4 py-3 grid grid-cols-[1fr_1fr_1fr_1fr] gap-4 items-end">
        {suppliers.length > 0 && (
          <div>
            <label className={fieldLabel}>Supplier</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className={cn(inputClass, 'w-full pr-7', !supplierId && 'text-muted-foreground/60')}
            >
              <option value="">None</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className={fieldLabel}>Invoice number</label>
          <input
            type="text"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            placeholder="e.g. INV-001"
            className={cn(inputClass, 'w-full')}
          />
        </div>

        <div>
          <label className={fieldLabel}>Invoice date</label>
          <input
            type="date"
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
            className={cn(inputClass, 'w-full')}
          />
        </div>

        <div>
          <label className={fieldLabel}>Note (audit trail)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Reason for change…"
            className={cn(inputClass, 'w-full')}
          />
        </div>
      </div>

      {error && <p className="px-4 pb-2 text-sm text-destructive">{error}</p>}

      <div className="flex items-center justify-end gap-2 border-t border-[var(--nav-border)] bg-muted/10 px-4 py-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
          <XIcon className="size-3.5 mr-1" />
          Cancel
        </Button>
        <Button type="button" size="sm" onClick={handleSave} disabled={saving}>
          <CheckIcon className="size-3.5 mr-1" />
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </div>
  );
}
