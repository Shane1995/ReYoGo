import { Button } from '@reyogo/ui';
import { formatMoney } from '../../../../../utils/formatMoney';

const th =
  'px-3 py-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 text-left';
const td = 'px-3 py-2 text-sm';

type ConfirmLine = {
  lineId: string;
  itemNameSnapshot: string;
  origQty: number;
  origUnitPrice: number;
  creditQty: number;
  creditPrice: number;
  isFreeGift: boolean;
};

type Props = {
  confirmedLines: ConfirmLine[];
  onBack: () => void;
  onConfirm: () => void;
};

export function ConfirmStep({ confirmedLines, onBack, onConfirm }: Props) {
  const creditTotal = confirmedLines.reduce((s, l) => s + l.creditQty * l.creditPrice, 0);

  return (
    <div className="border-t border-[var(--nav-border)] bg-[var(--nav-accent)]/30 px-6 py-4 space-y-4">
      <p className="text-sm font-medium">Confirm credit note</p>
      <p className="text-xs text-muted-foreground">
        The following stock will be reduced as of today. This cannot be undone.
      </p>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className={th}>Item</th>
            <th className={`${th} text-right`}>Was invoiced</th>
            <th className={`${th} text-right`}>Crediting</th>
            <th className={`${th} text-right`}>Δ</th>
          </tr>
        </thead>
        <tbody>
          {confirmedLines.map((l) => {
            const origTotal = l.origQty * l.origUnitPrice;
            const lineTotal = l.creditQty * l.creditPrice;
            const priceChanged = l.creditPrice !== l.origUnitPrice;

            return (
              <tr key={l.lineId} className="border-b border-border/50">
                <td className={td}>{l.itemNameSnapshot}</td>
                <td className={`${td} text-right tabular-nums text-muted-foreground font-mono`}>
                  {l.origQty} × £{formatMoney(l.origUnitPrice)} = £{formatMoney(origTotal)}
                </td>
                <td className={`${td} text-right tabular-nums font-mono`}>
                  {l.creditQty} × {priceChanged && <span className="text-amber-400 mr-0.5">●</span>}
                  £{formatMoney(l.creditPrice)} = £{formatMoney(lineTotal)}
                </td>
                <td className={`${td} text-right tabular-nums font-mono`}>
                  {l.isFreeGift && l.creditPrice === 0 ? (
                    <span className="text-white/40">Stock only</span>
                  ) : (
                    <span className="text-rose-400">-£{formatMoney(lineTotal)}</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className={`${td} text-right font-medium`}>
              Credit total
            </td>
            <td className={`${td} text-right tabular-nums font-mono text-rose-400 font-semibold`}>
              -£{formatMoney(creditTotal)}
            </td>
          </tr>
        </tfoot>
      </table>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onBack}>
          Back
        </Button>
        <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white" onClick={onConfirm}>
          Confirm
        </Button>
      </div>
    </div>
  );
}
