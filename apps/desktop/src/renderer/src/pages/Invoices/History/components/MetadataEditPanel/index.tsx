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

function dateOrNull(value: string): Date | null {
  if (!value) return null;
  return new Date(value);
}

function supplierIdOrNull(value: string): string | null {
  if (!value) return null;
  return value;
}

function errorMessage(e: unknown, fallback: string): string {
  if (e instanceof Error) return e.message;
  return fallback;
}

function saveLabelOf(saving: boolean): string {
  if (saving) return 'Saving…';
  return 'Save changes';
}

function orEmpty(value: string | null | undefined): string {
  if (value == null) return '';
  return value;
}

const fieldLabel = 'text-xs font-medium text-muted-foreground mb-1 block';

function ErrorMessage({ error }: { error: string | null }) {
  if (!error) return null;
  return <p className="px-4 pb-2 text-sm text-destructive">{error}</p>;
}

function SupplierField({
  suppliers,
  supplierId,
  onSupplierChange,
}: {
  suppliers: Supplier[];
  supplierId: string;
  onSupplierChange: (v: string) => void;
}) {
  if (suppliers.length === 0) return null;
  return (
    <div>
      <label className={fieldLabel}>Supplier</label>
      <select
        value={supplierId}
        onChange={(e) => onSupplierChange(e.target.value)}
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
  );
}

function FormFields({
  suppliers,
  supplierId,
  invoiceNumber,
  invoiceDate,
  note,
  onSupplierChange,
  onInvoiceNumberChange,
  onInvoiceDateChange,
  onNoteChange,
}: {
  suppliers: Supplier[];
  supplierId: string;
  invoiceNumber: string;
  invoiceDate: string;
  note: string;
  onSupplierChange: (v: string) => void;
  onInvoiceNumberChange: (v: string) => void;
  onInvoiceDateChange: (v: string) => void;
  onNoteChange: (v: string) => void;
}) {
  return (
    <div className="px-4 py-3 grid grid-cols-[1fr_1fr_1fr_1fr] gap-4 items-end">
      <SupplierField
        suppliers={suppliers}
        supplierId={supplierId}
        onSupplierChange={onSupplierChange}
      />
      <div>
        <label className={fieldLabel}>Invoice number</label>
        <input
          type="text"
          value={invoiceNumber}
          onChange={(e) => onInvoiceNumberChange(e.target.value)}
          placeholder="e.g. INV-001"
          className={cn(inputClass, 'w-full')}
        />
      </div>
      <div>
        <label className={fieldLabel}>Invoice date</label>
        <input
          type="date"
          value={invoiceDate}
          onChange={(e) => onInvoiceDateChange(e.target.value)}
          className={cn(inputClass, 'w-full')}
        />
      </div>
      <div>
        <label className={fieldLabel}>Note (audit trail)</label>
        <input
          type="text"
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="Reason for change…"
          className={cn(inputClass, 'w-full')}
        />
      </div>
    </div>
  );
}

export function MetadataEditPanel({ invoice, suppliers, onSave, onCancel }: Props) {
  const [supplierId, setSupplierId] = useState<string>(orEmpty(invoice.supplierId));
  const [invoiceNumber, setInvoiceNumber] = useState(orEmpty(invoice.invoiceNumber));
  const [invoiceDate, setInvoiceDate] = useState(toDateInput(invoice.invoiceDate));
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave({
        supplierId: supplierIdOrNull(supplierId),
        invoiceNumber: invoiceNumber.trim(),
        invoiceDate: dateOrNull(invoiceDate),
        note,
      });
    } catch (e) {
      setError(errorMessage(e, 'Failed to save'));
      setSaving(false);
    }
  };

  return (
    <div className="border-t border-[var(--nav-border)] bg-muted/5">
      <FormFields
        suppliers={suppliers}
        supplierId={supplierId}
        invoiceNumber={invoiceNumber}
        invoiceDate={invoiceDate}
        note={note}
        onSupplierChange={setSupplierId}
        onInvoiceNumberChange={setInvoiceNumber}
        onInvoiceDateChange={setInvoiceDate}
        onNoteChange={setNote}
      />
      <ErrorMessage error={error} />
      <div className="flex items-center justify-end gap-2 border-t border-[var(--nav-border)] bg-muted/10 px-4 py-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
          <XIcon className="size-3.5 mr-1" />
          Cancel
        </Button>
        <Button type="button" size="sm" onClick={handleSave} disabled={saving}>
          <CheckIcon className="size-3.5 mr-1" />
          {saveLabelOf(saving)}
        </Button>
      </div>
    </div>
  );
}
