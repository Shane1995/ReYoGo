import { useParams, useNavigate } from 'react-router-dom';
import { AnalysisRoutes } from '@/components/AppRoutes/routePaths';
import { useItemTrendData } from './hooks/useItemTrendData';
import { useFullHistoryData } from './hooks/useFullHistoryData';
import { avgPriceOf } from './utils/avgPriceOf';
import { ItemTrendHeader } from './components/ItemTrendHeader';
import { StatsAndCostSection } from './components/StatsAndCostSection';
import { NotFoundScreen } from './components/NotFoundScreen';
import { TrendChart } from './components/TrendChart';
import { HistoryTabs } from './components/HistoryTabs';

export default function ItemTrendPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const { loading, group, costHistory, chartData, stats } = useItemTrendData(itemId);
  const { movements } = useFullHistoryData(itemId);
  const goBack = () => navigate(AnalysisRoutes.CostPerUnit);

  if (loading) return <div className="p-6 text-muted-foreground">Loading…</div>;
  if (!group) return <NotFoundScreen onBack={goBack} />;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto p-5 space-y-5">
      <ItemTrendHeader group={group} stats={stats} onBack={goBack} />
      <StatsAndCostSection stats={stats} costHistory={costHistory} />
      <TrendChart chartData={chartData} avgPrice={avgPriceOf(stats)} uom={group.uom} />
      <HistoryTabs entries={group.entries} movements={movements} />
    </div>
  );
}
