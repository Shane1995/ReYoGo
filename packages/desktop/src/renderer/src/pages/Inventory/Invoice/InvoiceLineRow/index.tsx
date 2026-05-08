import { Fragment } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { ItemAutocomplete, type ItemOption } from "../ItemAutocomplete";
import type { ProcessReceiptLine } from "../types";
import { getProcessLineComputed } from "../types";
import { formatMoney } from "../utils/formatMoney";
import { inputClass } from "../utils/inputClass";
import { cn } from "@/lib/utils";

type ItemMeta = {
  categoryName?: string;
  typeLabel?: string;
  unitOfMeasure?: string | null;
};

type Props = {
  line: ProcessReceiptLine;
  isExpanded: boolean;
  isLast: boolean;
  sortedItems: ItemOption[];
  itemMeta: ItemMeta | undefined;
  onToggleExpand: () => void;
  onUpdate: (updates: Partial<ProcessReceiptLine>) => void;
  onRemove: () => void;
  onAddLine: (focusField?: string) => void;
  onNavigateNext: (field: string) => void;
};

function ItemMetaHint({
  line,
  itemMeta,
  computed,
}: {
  line: ProcessReceiptLine;
  itemMeta: ItemMeta;
  computed: ReturnType<typeof getProcessLineComputed>;
}) {
  const unitPrice =
    computed.netUnitPrice > 0
      ? `Unit price: ${formatMoney(line.vatMode === "inclusive" ? computed.grossUnitPrice : computed.netUnitPrice)} excl. VAT`
      : null;
  const parts = [itemMeta.categoryName, itemMeta.typeLabel, itemMeta.unitOfMeasure, unitPrice].filter(Boolean);
  if (parts.length === 0) return null;
  return (
    <p className="mt-0.5 text-xs text-muted-foreground truncate">{parts.join(" · ")}</p>
  );
}

export function InvoiceLineRow({
  line,
  isExpanded,
  isLast,
  sortedItems,
  itemMeta,
  onToggleExpand,
  onUpdate,
  onRemove,
  onAddLine,
  onNavigateNext,
}: Props) {
  const computed = getProcessLineComputed(line);

  return (
    <Fragment>
      <TableRow className="border-[var(--nav-border)] hover:bg-muted/30">
        <TableCell className="w-8 p-2 align-middle">
          <button
            type="button"
            onClick={onToggleExpand}
            className="text-muted-foreground hover:text-foreground p-0.5 -m-0.5 rounded"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Collapse results" : "Expand results"}
          >
            {isExpanded ? (
              <ChevronDownIcon className="size-4" aria-hidden />
            ) : (
              <ChevronRightIcon className="size-4" aria-hidden />
            )}
          </button>
        </TableCell>

        <TableCell className="py-2 px-3">
          <ItemAutocomplete
            inputId={`invoice-item-${line.id}`}
            items={sortedItems}
            value={line.itemId}
            onChange={(itemId) => onUpdate({ itemId })}
            placeholder="Search or select item…"
            onSelectComplete={() => {
              document.getElementById(`invoice-qty-${line.id}`)?.focus();
              if (isLast) onAddLine();
            }}
          />
          {line.itemId && itemMeta && (
            <ItemMetaHint line={line} itemMeta={itemMeta} computed={computed} />
          )}
        </TableCell>

        <TableCell className="py-2 px-3">
          <input
            id={`invoice-qty-${line.id}`}
            type="number"
            min={0}
            step={1}
            value={line.quantity || ""}
            onChange={(e) => onUpdate({ quantity: e.target.value === "" ? 0 : Number(e.target.value) })}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); onNavigateNext("qty"); }
              else if (e.key === "Tab") { e.preventDefault(); document.getElementById(`invoice-vat-${line.id}`)?.focus(); }
            }}
            className={cn(inputClass, "w-20")}
            placeholder="0"
          />
        </TableCell>

        <TableCell className="py-2 px-3">
          <select
            id={`invoice-vat-${line.id}`}
            value={line.vatMode}
            onChange={(e) => onUpdate({ vatMode: e.target.value as ProcessReceiptLine["vatMode"] })}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); e.currentTarget.click(); }
              else if (e.key === "Tab") { e.preventDefault(); document.getElementById(`invoice-vatrate-${line.id}`)?.focus(); }
            }}
            className={cn(inputClass, "min-w-[6rem] cursor-pointer")}
          >
            <option value="exclusive">No (add VAT)</option>
            <option value="inclusive">Yes (VAT included)</option>
            <option value="non-taxable">Non-taxable</option>
          </select>
        </TableCell>

        <TableCell className="py-2 px-3">
          <input
            id={`invoice-vatrate-${line.id}`}
            type="number"
            min={0}
            max={100}
            step={0.01}
            value={line.vatMode !== "non-taxable" ? line.vatRate : ""}
            onChange={(e) => onUpdate({ vatRate: e.target.value === "" ? 0 : Number(e.target.value) })}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); onNavigateNext("vatrate"); }
              else if (e.key === "Tab") { e.preventDefault(); document.getElementById(`invoice-total-${line.id}`)?.focus(); }
            }}
            disabled={line.vatMode === "non-taxable"}
            className={cn(inputClass, "w-20", line.vatMode === "non-taxable" && "opacity-50")}
            placeholder="15"
          />
        </TableCell>

        <TableCell className="py-2 px-3">
          <input
            id={`invoice-total-${line.id}`}
            type="number"
            min={0}
            step={1}
            value={line.totalVatExclude || ""}
            onChange={(e) => onUpdate({ totalVatExclude: e.target.value === "" ? 0 : Number(e.target.value) })}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); onNavigateNext("total"); }
              else if (e.key === "Tab") { e.preventDefault(); onAddLine(); }
            }}
            className={cn(inputClass, "w-28")}
            placeholder="0.00"
          />
        </TableCell>

        <TableCell className="py-2 px-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            onClick={onRemove}
          >
            Remove
          </Button>
        </TableCell>
      </TableRow>

      {isExpanded && (
        <TableRow className="border-[var(--nav-border)] bg-muted/20">
          <TableCell colSpan={7} className="py-2 pl-10 pr-4 align-top">
            <div className="flex flex-wrap gap-6 text-sm">
              <span className="text-muted-foreground">
                Net unit price <span className="font-mono text-foreground">{formatMoney(computed.netUnitPrice)}</span>
              </span>
              <span className="text-muted-foreground">
                Gross unit price <span className="font-mono text-foreground">{formatMoney(computed.grossUnitPrice)}</span>
              </span>
              <span className="text-muted-foreground">
                Net total <span className="font-mono text-foreground">{formatMoney(computed.netTotal)}</span>
              </span>
              <span className="text-muted-foreground">
                Gross total <span className="font-mono text-foreground">{formatMoney(computed.grossTotal)}</span>
              </span>
            </div>
          </TableCell>
        </TableRow>
      )}
    </Fragment>
  );
}
