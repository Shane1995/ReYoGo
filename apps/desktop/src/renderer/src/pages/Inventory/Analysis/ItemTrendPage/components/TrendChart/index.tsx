import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { fmt } from '../../../utils/format';

type ChartEntry = { date: string; fullDate: string; price: number; qty: number };

function PriceTip({
  active,
  payload,
  uom,
}: {
  active?: boolean;
  payload?: { payload: { fullDate: string; price: number; qty: number } }[];
  uom?: string;
}) {
  if (!active || !payload?.length) return null;
  const { fullDate, price, qty } = payload[0]!.payload;
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

type Props = {
  chartData: ChartEntry[];
  avgPrice: number;
  uom?: string;
};

export function TrendChart({ chartData, avgPrice, uom }: Props) {
  if (chartData.length < 2) {
    return (
      <div className="rounded-lg border border-[var(--nav-border)] bg-muted/10 p-10 text-center text-sm text-muted-foreground/60">
        Not enough data to show a trend — capture this item on at least 2 invoices.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--nav-border)] bg-background p-4">
      <p className="mb-4 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
        Price per unit over time (excl. VAT)
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--nav-border)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontFamily: 'DM Mono' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--nav-border)' }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontFamily: 'DM Mono' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => fmt(v)}
            width={52}
          />
          <Tooltip content={<PriceTip uom={uom} />} />
          <ReferenceLine
            y={avgPrice}
            stroke="var(--muted-foreground)"
            strokeDasharray="4 4"
            strokeOpacity={0.3}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="var(--primary)"
            strokeWidth={2}
            dot={{ r: 3.5, fill: 'var(--primary)', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: 'var(--primary)', strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="mt-2 text-center text-[11px] text-muted-foreground/40">
        Dashed line = average ({fmt(avgPrice)})
      </p>
    </div>
  );
}
