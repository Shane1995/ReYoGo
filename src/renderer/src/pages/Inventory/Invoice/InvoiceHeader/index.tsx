import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { InvoiceRoutes } from "@/components/AppRoutes/routePaths";
import { DatePicker } from "@/components/ui/date-picker";
import { inputClass } from "../utils/inputClass";
import { cn } from "@/lib/utils";

type Props = {
  invoiceNumber: string;
  onInvoiceNumberChange: (v: string) => void;
  invoiceDate: string;
  onInvoiceDateChange: (v: string) => void;
  onAddCategory: () => void;
  onAddItem: () => void;
};

export function InvoiceHeader({
  invoiceNumber,
  onInvoiceNumberChange,
  invoiceDate,
  onInvoiceDateChange,
  onAddCategory,
  onAddItem,
}: Props) {
  return (
    <header className="shrink-0 border-b border-[var(--nav-border)] bg-background px-4 py-3 space-y-3">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-lg font-semibold text-foreground">Capture Invoice</h1>
        <div className="flex gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to={InvoiceRoutes.History}>View history</Link>
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onAddCategory}>
            Add category
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onAddItem}>
            Add item
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground whitespace-nowrap">Invoice #</label>
          <input
            type="text"
            value={invoiceNumber}
            onChange={(e) => onInvoiceNumberChange(e.target.value)}
            placeholder="e.g. INV-0042"
            className={cn(inputClass, "w-36")}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground whitespace-nowrap">Invoice date</label>
          <DatePicker value={invoiceDate} onChange={onInvoiceDateChange} />
        </div>
      </div>
    </header>
  );
}
