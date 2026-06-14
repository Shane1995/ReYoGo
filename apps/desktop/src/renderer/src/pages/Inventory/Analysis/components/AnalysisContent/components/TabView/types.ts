import type { AnalysisTab } from '../../../../hooks/useAnalysisData';
import type { ItemGroup } from '../../../../types';

export type TabViewProps = {
  analysisTab: AnalysisTab;
  groups: ItemGroup[];
};
