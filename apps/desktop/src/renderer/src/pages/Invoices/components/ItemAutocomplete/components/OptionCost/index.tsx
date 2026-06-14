import { formatMoney } from '../../../../utils/formatMoney';
import type { OptionCostProps } from './types';

export function OptionCost({ cost }: OptionCostProps) {
  if (cost == null) return null;
  return (
    <span className="shrink-0 font-mono text-xs tabular-nums opacity-60">{formatMoney(cost)}</span>
  );
}
