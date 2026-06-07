import { Button } from '@reyogo/ui';
import { Checkbox } from '@/components/Checkbox';
import { formatMoney } from '../../../../../utils/formatMoney';

const th =
  'px-3 py-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 text-left';
const td = 'px-3 py-2 text-sm';
const inputBase =
  'w-20 h-7 rounded border border-input bg-background px-2 text-right text-sm tabular-nums focus:outline-none disabled:opacity-40';
const inputCls = `${inputBase} focus:ring-2 focus:ring-ring/50`;

function priceCls(modified: boolean): string {
  return modified
    ? `${inputBase} ring-1 ring-amber-400/50 focus:ring-2 focus:ring-amber-400/50`
    : inputCls;
}

type EditLine = {
  lineId: string;
  itemNameSnapshot: string;
  origQty: number;
  origUnitPrice: number;
  creditQty: number;
  creditPrice: number;
  selected: boolean;
};

type Props = {
  invoiceNumber: string;
  lines: EditLine[];
  allSelected: boolean;
  someSelected: boolean;
  editTotal: number;
  canContinue: boolean;
  onToggleAll: () => void;
  onToggleLine: (lineId: string) => void;
  onSetQty: (lineId: string, qty: number) => void;
  onSetPrice: (lineId: string, price: number) => void;
  onCancel: () => void;
  onContinue: () => void;
};

export function EditStep({
  invoiceNumber,
  lines,
  allSelected,
  someSelected,
  editTotal,
  canContinue,
  onToggleAll,
  onToggleLine,
  onSetQty,
  onSetPrice,
  onCancel,
  onContinue,
}: Props) {
  return (
    <div className="border-t border-[var(--nav-border)] bg-[var(--nav-accent)]/30 px-6 py-4 space-y-4">
      <p className="text-sm font-medium">Raise credit note against {invoiceNumber}</p>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className={th}>
              <Checkbox checked={allSelected} indeterminate={someSelected} onChange={onToggleAll} />
            </th>
            <th className={th}>Item</th>
            <th className={`${th} text-right`}>Orig qty</th>
            <th className={`${th} text-right`}>Orig price</th>
            <th className={`${th} text-right`}>Credit qty</th>
            <th className={`${th} text-right`}>Credit price</th>
            <th className={`${th} text-right`}>Total</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l) => (
            <tr
              key={l.lineId}
              className={`border-b border-border/50 ${!l.selected ? 'opacity-40' : ''}`}
            >
              <td className="px-3 py-2 w-8">
                <Checkbox checked={l.selected} onChange={() => onToggleLine(l.lineId)} />
              </td>
              <td className={td}>{l.itemNameSnapshot}</td>
              <td className={`${td} text-right tabular-nums text-muted-foreground`}>{l.origQty}</td>
              <td className={`${td} text-right tabular-nums text-muted-foreground font-mono`}>
                £{formatMoney(l.origUnitPrice)}
              </td>
              <td className={`${td} text-right`}>
                <input
                  type="number"
                  min={0}
                  max={l.origQty}
                  step={1}
                  value={l.creditQty}
                  disabled={!l.selected}
                  onChange={(e) => onSetQty(l.lineId, Number(e.target.value))}
                  className={inputCls}
                />
              </td>
              <td className={`${td} text-right`}>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={l.creditPrice}
                  disabled={!l.selected}
                  onChange={(e) => onSetPrice(l.lineId, Number(e.target.value))}
                  className={priceCls(l.creditPrice !== l.origUnitPrice)}
                />
              </td>
              <td className={`${td} text-right tabular-nums font-mono`}>
                {l.selected ? `£${formatMoney(l.creditQty * l.creditPrice)}` : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Credit total:{' '}
          <span className="font-mono font-medium text-foreground">£{formatMoney(editTotal)}</span>
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="sm" disabled={!canContinue} onClick={onContinue}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
