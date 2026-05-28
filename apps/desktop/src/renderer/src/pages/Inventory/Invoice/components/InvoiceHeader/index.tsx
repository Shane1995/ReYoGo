import { Button, PageHeader, DatePicker } from '@reyogo/ui';
import { Link } from 'react-router-dom';
import { RotateCcwIcon } from 'lucide-react';
import { InvoiceRoutes } from '@/components/AppRoutes/routePaths';
import type { Supplier } from '@reyogo/types';
import type { VatMode } from '../../types';
import { inputClass } from '../../utils/inputClass';
import { cn } from '@reyogo/ui';

type Props = {
  invoiceNumber: string;
  onInvoiceNumberChange: (v: string) => void;
  invoiceDate: string;
  onInvoiceDateChange: (v: string) => void;
  supplierId: string;
  onSupplierChange: (id: string) => void;
  suppliers: Supplier[];
  vatMode: VatMode;
  onVatModeChange: (mode: VatMode) => void;
  vatRate: number;
  onVatRateChange: (rate: number) => void;
  onAddCategory: () => void;
  onAddItem: () => void;
  isDirty: boolean;
  onClear: () => void;
};

const fieldLabel =
  'text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 mb-1';
const fieldGroup = 'flex flex-col';

export function InvoiceHeader({
  invoiceNumber,
  onInvoiceNumberChange,
  invoiceDate,
  onInvoiceDateChange,
  supplierId,
  onSupplierChange,
  suppliers,
  vatMode,
  onVatModeChange,
  vatRate,
  onVatRateChange,
  onAddCategory,
  onAddItem,
  isDirty,
  onClear,
}: Props) {
  return (
    <PageHeader
      title="Capture Invoice"
      actions={
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to={InvoiceRoutes.History}>History</Link>
          </Button>
          <div className="h-4 w-px bg-border" />
          <Button type="button" variant="outline" size="sm" onClick={onAddCategory}>
            + Category
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onAddItem}>
            + Item
          </Button>
        </div>
      }
    >
      <div className="flex flex-wrap items-end gap-x-5 gap-y-3 pb-1">
        <div className={fieldGroup}>
          <label className={fieldLabel}>Invoice #</label>
          <input
            type="text"
            value={invoiceNumber}
            onChange={(e) => onInvoiceNumberChange(e.target.value)}
            placeholder="INV-0042"
            className={cn(
              inputClass,
              'w-52 font-mono text-[13px] placeholder:text-muted-foreground/40',
            )}
          />
        </div>

        <div className={fieldGroup}>
          <label className={fieldLabel}>Date</label>
          <DatePicker value={invoiceDate} onChange={onInvoiceDateChange} />
        </div>

        <div className={fieldGroup}>
          <label className={fieldLabel}>Supplier</label>
          <select
            value={supplierId}
            onChange={(e) => onSupplierChange(e.target.value)}
            className={cn(inputClass, 'w-44')}
          >
            <option value="">— none —</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="h-8 w-px bg-border/60 self-end mb-0.5 hidden sm:block" />

        <div className={fieldGroup}>
          <label className={fieldLabel}>VAT treatment</label>
          <select
            value={vatMode}
            onChange={(e) => onVatModeChange(e.target.value as VatMode)}
            className={cn(inputClass, 'w-40')}
          >
            <option value="exclusive">+ VAT (exclusive)</option>
            <option value="inclusive">VAT included</option>
          </select>
        </div>

        <div className={fieldGroup}>
          <label className={fieldLabel}>Rate %</label>
          <input
            type="number"
            min={0}
            max={100}
            step={1}
            value={vatRate}
            onChange={(e) => onVatRateChange(Number(e.target.value))}
            className={cn(inputClass, 'w-16 font-mono')}
          />
        </div>

        {isDirty && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1.5 self-end mb-0.5 text-xs text-muted-foreground/60 hover:text-destructive transition-colors"
          >
            <RotateCcwIcon className="size-3" />
            Clear
          </button>
        )}
      </div>
    </PageHeader>
  );
}
