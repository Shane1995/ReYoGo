import { useState, useCallback } from 'react';
import { XIcon, CheckIcon } from 'lucide-react';
import { Button } from '@reyogo/ui';
import { useInventory } from '@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext';
import { VatMode } from '@reyogo/types';
import type { ICapturedInvoiceWithLines } from '@reyogo/types';
import { ItemAutocomplete } from '../../../components/ItemAutocomplete';
import type { ProcessReceiptLine } from '../../../types';
import { getProcessLineComputed } from '../../../types';
import { inputClass } from '../../../utils/inputClass';
import { formatMoney } from '../../../utils/formatMoney';
import { createEmptyLine } from '../../../utils/createEmptyLine';
import { lineToEditLine } from '../../../utils/lineToEditLine';
import { cn } from '@reyogo/ui';
import { Checkbox } from '@/components/Checkbox';

type Props = {
  invoice: ICapturedInvoiceWithLines;
  onSave: (lines: ProcessReceiptLine[], note: string) => Promise<void>;
  onCancel: () => void;
};

export function EditPanel({ invoice, onSave, onCancel }: Props) {
  const { items, categories } = useInventory();
  const [lines, setLines] = useState<ProcessReceiptLine[]>(() =>
    invoice.lines.length > 0
      ? invoice.lines.map((l) => lineToEditLine(l, invoice.vatMode, invoice.vatRate))
      : [createEmptyLine()],
  );
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { vatMode, vatRate } = invoice;

  const itemsWithCategory = items.map((item) => {
    const cat = categories.find((c) => c.id === item.categoryId);
    return { ...item, categoryName: cat?.name ?? '', typeLabel: cat?.type ?? '' };
  });

  const updateLine = useCallback((id: string, updates: Partial<ProcessReceiptLine>) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  }, []);

  const removeLine = useCallback((id: string) => {
    setLines((prev) => {
      const next = prev.filter((l) => l.id !== id);
      return next.length > 0 ? next : [createEmptyLine()];
    });
  }, []);

  const validLines = lines.filter(
    (l) => l.itemId && Number(l.quantity) >= 0 && (l.totalVatExclude ?? 0) >= 0,
  );

  const handleSave = async () => {
    if (validLines.length === 0) {
      setError('Add at least one line with an item.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(validLines, note);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
      setSaving(false);
    }
  };

  const summary = lines.reduce(
    (acc, l) => {
      const c = getProcessLineComputed(l, vatMode, vatRate);
      return {
        excl: acc.excl + c.netTotal,
        vat: acc.vat + c.vatAmount,
        total: acc.total + c.grossTotal,
      };
    },
    { excl: 0, vat: 0, total: 0 },
  );

  return (
    <div className="border-t border-[var(--nav-border)] bg-muted/5">
      <div className="flex items-center gap-4 px-4 pt-3 pb-2">
        <div className="flex items-center gap-3">
          <label className="shrink-0 text-sm font-medium text-muted-foreground">Edit note</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional reason for this edit (recorded in audit trail)"
            className={cn(inputClass, 'max-w-md')}
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            VAT:{' '}
            <span className="text-foreground">
              {vatMode === VatMode.Inclusive ? 'Inclusive' : 'Exclusive'} · {vatRate}%
            </span>
          </span>
        </div>
      </div>

      <div className="px-4 pb-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--nav-border)]">
              <th className="pb-2 pr-3 text-left font-medium">Item</th>
              <th className="pb-2 pr-3 text-right font-medium w-20">Qty</th>
              <th className="pb-2 pr-3 text-center font-medium w-20">Taxable</th>
              <th className="pb-2 pr-3 text-right font-medium w-28">Total</th>
              <th className="pb-2 w-16" />
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={line.id} className="border-b border-[var(--nav-border)]/40">
                <td className="py-1.5 pr-3">
                  <ItemAutocomplete
                    items={[...itemsWithCategory].sort((a, b) => a.name.localeCompare(b.name))}
                    value={line.itemId}
                    onChange={(itemId) => updateLine(line.id, { itemId })}
                    entityId={invoice.entityId}
                    placeholder="Select item…"
                  />
                </td>
                <td className="py-1.5 pr-3">
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={line.quantity || ''}
                    onChange={(e) =>
                      updateLine(line.id, {
                        quantity: e.target.value === '' ? 0 : Number(e.target.value),
                      })
                    }
                    className={cn(inputClass, 'w-20')}
                    placeholder="0"
                  />
                </td>
                <td className="py-1.5 pr-3 text-center">
                  <Checkbox
                    checked={line.isVatable}
                    onChange={(val) => updateLine(line.id, { isVatable: val })}
                  />
                </td>
                <td className="py-1.5 pr-3">
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={line.totalVatExclude || ''}
                    onChange={(e) =>
                      updateLine(line.id, {
                        totalVatExclude: e.target.value === '' ? 0 : Number(e.target.value),
                      })
                    }
                    className={cn(inputClass, 'w-28')}
                    placeholder="0.00"
                  />
                </td>
                <td className="py-1.5">
                  <button
                    type="button"
                    onClick={() => removeLine(line.id)}
                    className="text-xs text-muted-foreground hover:text-destructive px-1"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          type="button"
          onClick={() => setLines((prev) => [...prev, createEmptyLine()])}
          className="mt-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          + Add row
        </button>
      </div>

      {error && <p className="px-4 pb-2 text-sm text-destructive">{error}</p>}

      <div className="flex items-center justify-between gap-4 border-t border-[var(--nav-border)] bg-muted/10 px-4 py-2">
        <div className="flex gap-5 text-sm text-muted-foreground">
          <span>
            Excl.{' '}
            <span className="font-mono font-medium text-foreground">
              {formatMoney(summary.excl)}
            </span>
          </span>
          <span>
            VAT{' '}
            <span className="font-mono font-medium text-foreground">
              {formatMoney(summary.vat)}
            </span>
          </span>
          <span>
            Total{' '}
            <span className="font-mono font-semibold text-foreground">
              {formatMoney(summary.total)}
            </span>
          </span>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
            <XIcon className="size-3.5 mr-1" />
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={saving || validLines.length === 0}
          >
            <CheckIcon className="size-3.5 mr-1" />
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
