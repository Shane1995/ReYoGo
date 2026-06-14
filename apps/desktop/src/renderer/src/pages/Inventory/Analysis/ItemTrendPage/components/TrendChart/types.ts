export type ChartEntry = { date: string; fullDate: string; price: number; qty: number };

export type TrendChartProps = {
  chartData: ChartEntry[];
  avgPrice: number;
  uom?: string;
};
