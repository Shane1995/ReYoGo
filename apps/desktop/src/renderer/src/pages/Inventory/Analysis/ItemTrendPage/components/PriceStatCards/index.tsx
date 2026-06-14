import { fmt, fmtPct } from '../../../utils/format';
import { changeCls } from '../../../utils/styles';
import { StatCard } from '../StatCard';
import type { PriceStatCardsProps } from './types';

export function PriceStatCards({ stats }: PriceStatCardsProps) {
  const uomSuffix = stats.uom ? ` / ${stats.uom}` : '';
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard label="First price" value={`${fmt(stats.first)}${uomSuffix}`} />
      <StatCard label="Latest price" value={`${fmt(stats.last)}${uomSuffix}`} />
      <StatCard label="Average price" value={`${fmt(stats.avg)}${uomSuffix}`} muted />
      <StatCard
        label="Overall change"
        value={stats.change === null ? '—' : fmtPct(stats.change)}
        className={changeCls(stats.change, true)}
      />
    </div>
  );
}
