import type { ICapturedInvoiceWithLines } from '@reyogo/types';
import { formatMoney } from '../../../utils/formatMoney';
import { invoiceTotals } from '../../../utils/invoiceTotals';

type Props = { invoice: ICapturedInvoiceWithLines };

export function InvoiceDetailLines({ invoice }: Props) {
  if (invoice.lines.length === 0) {
    return <p className="text-sm text-muted-foreground">No line items.</p>;
  }

  const t = invoiceTotals(invoice);

  return (
    <>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--nav-border)]">
            <th className="pb-2 pr-4 text-left text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
              Item
            </th>
            <th className="pb-2 pr-4 text-right text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
              Qty
            </th>
            <th className="pb-2 pr-4 text-right text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
              Unit
            </th>
            <th className="pb-2 pr-4 text-right text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
              Unit price
            </th>
            <th className="pb-2 pr-4 text-center text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
              VAT
            </th>
            <th className="pb-2 text-right text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
              Line total
            </th>
          </tr>
        </thead>
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
      <div className="mt-3 flex gap-6 text-sm border-t border-[var(--nav-border)] pt-3">
        <span className="text-muted-foreground/60 text-[11px] uppercase tracking-widest font-medium">
          Excl.{' '}
          <span className="font-mono font-semibold text-foreground text-sm normal-case tracking-normal">
            {formatMoney(t.excl)}
          </span>
        </span>
        <span className="text-muted-foreground/60 text-[11px] uppercase tracking-widest font-medium">
          VAT{' '}
          <span className="font-mono font-semibold text-foreground text-sm normal-case tracking-normal">
            {formatMoney(t.vat)}
          </span>
        </span>
        <span className="text-muted-foreground/60 text-[11px] uppercase tracking-widest font-medium">
          Total{' '}
          <span className="font-mono font-bold text-foreground text-sm normal-case tracking-normal">
            {formatMoney(t.total)}
          </span>
        </span>
        <span className="text-muted-foreground/60 text-[11px] uppercase tracking-widest font-medium">
          Mode{' '}
          <span className="font-medium text-foreground text-sm normal-case tracking-normal">
            {invoice.vatMode === 'inclusive' ? 'Incl.' : 'Excl.'} · {invoice.vatRate}%
          </span>
        </span>
      </div>
    </>
  );
}
