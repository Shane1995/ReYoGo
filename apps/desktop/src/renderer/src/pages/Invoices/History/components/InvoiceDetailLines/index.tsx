import { VatMode } from '@reyogo/types';
import type { ICapturedInvoiceWithLines } from '@reyogo/types';
import { formatMoney } from '../../../utils/formatMoney';
import { invoiceTotals } from '../../../utils/invoiceTotals';

const thCls = 'pb-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60';

function DetailLinesHead() {
  return (
    <thead>
      <tr className="border-b border-[var(--nav-border)]">
        <th className={`${thCls} pr-4 text-left`}>Item</th>
        <th className={`${thCls} pr-4 text-right`}>Qty</th>
        <th className={`${thCls} pr-4 text-right`}>Unit</th>
        <th className={`${thCls} pr-4 text-right`}>Unit price</th>
        <th className={`${thCls} pr-4 text-center`}>VAT</th>
        <th className={`${thCls} text-right`}>Line total</th>
      </tr>
    </thead>
  );
}

function TotalsSummary({
  excl,
  vat,
  total,
  vatMode,
  vatRate,
}: {
  excl: number;
  vat: number;
  total: number;
  vatMode: string;
  vatRate: number;
}) {
  const statCls = 'text-muted-foreground/60 text-[11px] uppercase tracking-widest font-medium';
  const valCls = 'font-mono font-semibold text-foreground text-sm normal-case tracking-normal';
  return (
    <div className="mt-3 flex gap-6 text-sm border-t border-[var(--nav-border)] pt-3">
      <span className={statCls}>
        Excl. <span className={valCls}>{formatMoney(excl)}</span>
      </span>
      <span className={statCls}>
        VAT <span className={valCls}>{formatMoney(vat)}</span>
      </span>
      <span className={statCls}>
        Total <span className={`${valCls} font-bold`}>{formatMoney(total)}</span>
      </span>
      <span className={statCls}>
        Mode{' '}
        <span className="font-medium text-foreground text-sm normal-case tracking-normal">
          {vatMode === VatMode.Inclusive ? 'Incl.' : 'Excl.'} · {vatRate}%
        </span>
      </span>
    </div>
  );
}

type Props = { invoice: ICapturedInvoiceWithLines };

export function InvoiceDetailLines({ invoice }: Props) {
  if (invoice.lines.length === 0) {
    return <p className="text-sm text-muted-foreground">No line items.</p>;
  }

  const t = invoiceTotals(invoice);

  return (
    <>
      <table className="w-full text-sm">
        <DetailLinesHead />
        <tbody>
          {invoice.lines.map((line) => {
            const qty = line.quantity || 0;
            const unitPrice = qty > 0 ? line.totalVatExclude / qty : 0;
            return (
              <tr key={line.id} className="border-b border-[var(--nav-border)]/50">
                <td className="py-1.5 pr-4">{line.itemNameSnapshot}</td>
                <td className="py-1.5 pr-4 text-right font-mono tabular-nums">{line.quantity}</td>
                <td className="py-1.5 pr-4 text-right text-muted-foreground/60">
                  {line.unitOfMeasure ?? '—'}
                </td>
                <td className="py-1.5 pr-4 text-right font-mono tabular-nums">
                  {formatMoney(unitPrice)}
                </td>
                <td className="py-1.5 pr-4 text-center">
                  {line.isVatable ? (
                    <span className="text-[var(--nav-active-border)]">✓</span>
                  ) : (
                    <span className="text-muted-foreground/30">—</span>
                  )}
                </td>
                <td className="py-1.5 text-right font-mono tabular-nums font-medium">
                  {formatMoney(line.totalVatExclude)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <TotalsSummary
        excl={t.excl}
        vat={t.vat}
        total={t.total}
        vatMode={invoice.vatMode}
        vatRate={invoice.vatRate}
      />
    </>
  );
}
