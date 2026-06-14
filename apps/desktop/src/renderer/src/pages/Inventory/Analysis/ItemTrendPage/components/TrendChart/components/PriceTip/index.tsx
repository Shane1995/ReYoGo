import { fmt } from '../../../../../utils/format';
import { tipEntryOf } from './utils/tipEntryOf';
import type { PriceTipProps } from './types';

export function PriceTip({ active, payload, uom }: PriceTipProps) {
  if (!active) return null;
  const entry = tipEntryOf(payload);
  if (!entry) return null;
  const { fullDate, price, qty } = entry;
  return (
    <div className="rounded-lg border border-[var(--nav-border)] bg-background px-3 py-2 text-sm shadow-md">
      <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60 mb-1">
        {fullDate}
      </p>
      <p className="font-mono font-semibold tabular-nums text-foreground">
        {fmt(price)}
        {uom ? <span className="text-muted-foreground/60"> / {uom}</span> : ''}
      </p>
      <p className="text-[11px] text-muted-foreground/60 mt-0.5">qty {qty}</p>
    </div>
  );
}
