import { Button, PageHeader } from '@reyogo/ui';
import { Link } from 'react-router-dom';
import { InvoiceRoutes } from '@/components/AppRoutes/routePaths';
import { DatePicker } from '@reyogo/ui';
import type { Supplier } from '@reyogo/types';
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
  vatRate: number;
  onVatRateChange: (rate: number) => void;
  onAddCategory: () => void;
  onAddItem: () => void;
  isDirty: boolean;
  onClear: () => void;
};

export function InvoiceHeader({
  invoiceNumber,
  onInvoiceNumberChange,
  invoiceDate,
  onInvoiceDateChange,
  supplierId,
  onSupplierChange,
  suppliers,
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
        <div className="flex gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to={InvoiceRoutes.History}>View history</Link>
          </Button>
          {isDirty && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-muted-foreground hover:text-destructive"
            >
              Clear
            </Button>
          )}
          <Button type="button" variant="outline" size="sm" onClick={onAddCategory}>
            Add category
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onAddItem}>
            Add item
          </Button>
        </div>
      }
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground whitespace-nowrap">Invoice #</label>
          <input
            type="text"
            value={invoiceNumber}
            onChange={(e) => onInvoiceNumberChange(e.target.value)}
            placeholder="e.g. INV-0042"
            className={cn(inputClass, 'w-36')}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground whitespace-nowrap">Invoice date</label>
          <DatePicker value={invoiceDate} onChange={onInvoiceDateChange} />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground whitespace-nowrap">Supplier</label>
          <select
            value={supplierId}
            onChange={(e) => onSupplierChange(e.target.value)}
            className={cn(inputClass, 'w-44')}
          >
            <option value="">No supplier</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground whitespace-nowrap">VAT rate %</label>
          <input
            type="number"
            min={0}
            max={100}
            step={1}
            value={vatRate}
            onChange={(e) => onVatRateChange(Number(e.target.value))}
            className={cn(inputClass, 'w-20')}
          />
        </div>
      </div>
    </PageHeader>
  );
}
