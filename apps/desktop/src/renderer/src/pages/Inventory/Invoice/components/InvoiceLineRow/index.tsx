import { Fragment } from 'react';
import { ChevronDownIcon, ChevronRightIcon, XIcon } from 'lucide-react';
import { TableCell, TableRow } from '@reyogo/ui';
import { ItemAutocomplete, type ItemOption } from '../ItemAutocomplete';
import { VatMode } from '@reyogo/types';
import type { ProcessReceiptLine } from '../../types';
import { getProcessLineComputed } from '../../types';
import { formatMoney } from '../../utils/formatMoney';
import { inputClass } from '../../utils/inputClass';
import { cn } from '@reyogo/ui';

type ItemMeta = {
  categoryName?: string;
  typeLabel?: string;
  unitOfMeasure?: string | null;
  lastUnitCostInclVat?: number;
};

type Props = {
  line: ProcessReceiptLine;
  index: number;
  vatMode: VatMode;
  vatRate: number;
  isExpanded: boolean;
  isLast: boolean;
  sortedItems: ItemOption[];
  entityId: string;
  itemMeta: ItemMeta | undefined;
  onToggleExpand: () => void;
  onUpdate: (updates: Partial<ProcessReceiptLine>) => void;
  onRemove: () => void;
  onAddLine: (focusField?: string) => void;
  onNavigateNext: (field: string) => void;
};

function ItemMetaHint({
  itemMeta,
  vatMode,
  computed,
}: {
  itemMeta: ItemMeta;
  vatMode: VatMode;
  computed: ReturnType<typeof getProcessLineComputed>;
}) {
  const unitPrice =
    computed.netUnitPrice > 0
      ? `${formatMoney(vatMode === VatMode.Inclusive ? computed.grossUnitPrice : computed.netUnitPrice)} / unit`
      : null;
  const lastCost =
    itemMeta.lastUnitCostInclVat != null
      ? `Last ${formatMoney(itemMeta.lastUnitCostInclVat)} incl. VAT`
      : null;
  const parts = [
    itemMeta.categoryName,
    itemMeta.typeLabel,
    itemMeta.unitOfMeasure,
    unitPrice,
    lastCost,
  ].filter(Boolean);
  if (parts.length === 0) return null;
  return (
    <p className="mt-0.5 text-[11px] text-muted-foreground/60 truncate tracking-wide">
      {parts.join(' · ')}
    </p>
  );
}

export function InvoiceLineRow({
  line,
  index,
  vatMode,
  vatRate,
  isExpanded,
  isLast,
  sortedItems,
  entityId,
  itemMeta,
  onToggleExpand,
  onUpdate,
  onRemove,
  onAddLine,
  onNavigateNext,
}: Props) {
  const computed = getProcessLineComputed(line, vatMode, vatRate);

  return (
    <Fragment>
      <TableRow
        className={cn(
          'border-[var(--nav-border)] transition-colors group',
          isExpanded ? 'bg-[var(--nav-accent)]/30' : 'hover:bg-muted/20',
          !isExpanded && index % 2 !== 0 && 'bg-black/[0.025]',
        )}
      >
        <TableCell className="w-8 p-2 align-middle">
          <button
            type="button"
            onClick={onToggleExpand}
            className={cn(
              'rounded p-0.5 -m-0.5 transition-colors',
              isExpanded ? 'text-primary' : 'text-muted-foreground/40 hover:text-muted-foreground',
            )}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
          >
            {isExpanded ? (
              <ChevronDownIcon className="size-3.5" aria-hidden />
            ) : (
              <ChevronRightIcon className="size-3.5" aria-hidden />
            )}
          </button>
        </TableCell>

        <TableCell className="py-2 px-3">
          <ItemAutocomplete
            inputId={`invoice-item-${line.id}`}
            items={sortedItems}
            value={line.itemId}
            onChange={(itemId) => onUpdate({ itemId })}
            entityId={entityId}
            placeholder="Search item…"
            onSelectComplete={() => {
              document.getElementById(`invoice-qty-${line.id}`)?.focus();
              if (isLast) onAddLine();
            }}
          />
          {line.itemId && itemMeta && (
            <ItemMetaHint itemMeta={itemMeta} vatMode={vatMode} computed={computed} />
          )}
        </TableCell>

        <TableCell className="py-2 px-3">
          <input
            id={`invoice-qty-${line.id}`}
            type="number"
            min={0}
            step={1}
            value={line.quantity || ''}
            onChange={(e) =>
              onUpdate({ quantity: e.target.value === '' ? 0 : Number(e.target.value) })
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onNavigateNext('qty');
              } else if (e.key === 'Tab') {
                e.preventDefault();
                document.getElementById(`invoice-total-${line.id}`)?.focus();
              }
            }}
            className={cn(inputClass, 'w-20 font-mono')}
            placeholder="0"
          />
        </TableCell>

        <TableCell className="py-2 px-3 text-center">
          <button
            id={`invoice-vat-${line.id}`}
            type="button"
            role="checkbox"
            aria-checked={line.isVatable}
            onClick={() => onUpdate({ isVatable: !line.isVatable })}
            title={line.isVatable ? 'Taxable — click to exempt' : 'Exempt — click to make taxable'}
            className={cn(
              'inline-flex items-center justify-center size-5 rounded border transition-all',
              line.isVatable
                ? 'bg-primary border-primary text-primary-foreground'
                : 'bg-background border-input text-transparent hover:border-primary/50',
            )}
          >
            <svg viewBox="0 0 10 8" className="size-2.5 fill-current" aria-hidden>
              <path
                d="M1 4l3 3 5-6"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </TableCell>

        <TableCell className="py-2 px-3">
          <input
            id={`invoice-total-${line.id}`}
            type="number"
            min={0}
            step={1}
            value={line.totalVatExclude || ''}
            onChange={(e) =>
              onUpdate({ totalVatExclude: e.target.value === '' ? 0 : Number(e.target.value) })
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onNavigateNext('total');
              } else if (e.key === 'Tab') {
                e.preventDefault();
                onAddLine();
              }
            }}
            className={cn(inputClass, 'w-28 font-mono')}
            placeholder="0.00"
          />
        </TableCell>

        <TableCell className="py-2 px-2 text-right">
          <button
            type="button"
            onClick={onRemove}
            title="Remove line"
            className="opacity-0 group-hover:opacity-100 rounded p-1 text-muted-foreground/50 hover:bg-destructive/10 hover:text-destructive transition-all"
          >
            <XIcon className="size-3.5" aria-hidden />
          </button>
        </TableCell>
      </TableRow>

      {isExpanded && (
        <TableRow className="border-[var(--nav-border)] bg-[var(--nav-accent)]/20">
          <TableCell colSpan={7} className="py-2.5 pl-10 pr-4 align-top">
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 sm:flex sm:flex-wrap sm:gap-x-8">
              {[
                { label: 'Net unit', value: computed.netUnitPrice },
                { label: 'Gross unit', value: computed.grossUnitPrice },
                { label: 'Net total', value: computed.netTotal },
                { label: 'Gross total', value: computed.grossTotal },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-baseline gap-1.5">
                  <span className="text-[11px] uppercase tracking-widest text-muted-foreground/60">
                    {label}
                  </span>
                  <span className="font-mono text-sm text-foreground tabular-nums">
                    {formatMoney(value)}
                  </span>
                </div>
              ))}
            </div>
          </TableCell>
        </TableRow>
      )}
    </Fragment>
  );
}
