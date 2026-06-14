import { SummaryTableView } from '../../../SummaryTableView';
import { TableView } from '../../../TableView';
import { ByCategoryView } from '../../../ByCategoryView';
import type { TabViewProps } from './types';

export function TabView({ analysisTab, groups }: TabViewProps) {
  if (analysisTab === 'all') return <TableView groups={groups} />;
  if (analysisTab === 'by-type') return <SummaryTableView groups={groups} />;
  return <ByCategoryView groups={groups} />;
}
