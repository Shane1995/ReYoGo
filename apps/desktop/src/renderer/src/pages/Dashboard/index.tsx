import { StatCard, PageHeader } from '@reyogo/ui';
import { CheckCircle2Icon } from 'lucide-react';
import { type StatCardConfig } from '@/config/app.config';
import { useAppConfig } from '@/Context';
import { resolveIcon } from '@/config/resolvers';
import { useDashboardStats, type DashboardStats } from '@/hooks/useDashboardStats';
import { formatZAR } from '@/utils/format';

function isDynamic(card: StatCardConfig): card is Extract<StatCardConfig, { dataKey: string }> {
  return 'dataKey' in card;
}

function resolveStatCard(
  card: StatCardConfig,
  stats: DashboardStats | null,
  loading: boolean,
) {
  const icon = resolveIcon(card.icon);
  if (isDynamic(card)) {
    return {
      label: card.label,
      value: stats ? formatZAR(stats[card.dataKey]) : 'R 0.00',
      icon,
      iconClassName: card.iconClassName,
      showLoading: loading,
    };
  }
  return {
    label: card.label,
    value: card.staticValue,
    icon,
    iconClassName: card.iconClassName,
    showLoading: false,
  };
}

export default function DashboardPage() {
  const { config } = useAppConfig();
  const { stats, loading } = useDashboardStats();

  const statCards = config.dashboard.statCards.map((card) =>
    resolveStatCard(card, stats, loading),
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader title="Dashboard" />
      <div className="w-full px-5 py-4 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {statCards.map((card) => (
            <StatCard
              key={card.label}
              label={card.label}
              value={card.value}
              icon={card.icon}
              loading={card.showLoading}
              iconClassName={card.iconClassName}
            />
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            Low Stock Alerts
          </h2>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <LowStockEmpty />
          </div>
        </div>
      </div>
    </div>
  );
}

function LowStockEmpty() {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-6 text-center">
      <CheckCircle2Icon className="size-8 text-[var(--primary)]" aria-hidden />
      <p className="text-sm font-medium text-[var(--foreground)]">
        All items are above minimum stock levels
      </p>
      <p className="text-xs text-[var(--muted-foreground)]">
        Low stock alerts will appear here when items fall below their reorder point.
      </p>
    </div>
  );
}
