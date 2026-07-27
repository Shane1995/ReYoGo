import { SummaryTableView } from '../../../SummaryTableView';
import { TableView } from '../../../TableView';
import { ByCategoryView } from '../../../ByCategoryView';
import { AnalysisTab } from '../../../../types';
import type { TabViewProps } from './types';

export function TabView({ analysisTab, groups }: TabViewProps) {
  if (analysisTab === AnalysisTab.All) return <TableView groups={groups} />;
  if (analysisTab === AnalysisTab.ByType) return <SummaryTableView groups={groups} />;
  return <ByCategoryView groups={groups} />;
}
