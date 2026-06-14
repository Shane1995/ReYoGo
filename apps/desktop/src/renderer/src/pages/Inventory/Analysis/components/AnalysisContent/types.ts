import type { AnalysisTab } from '../../hooks/useAnalysisData';
import type { ItemGroup } from '../../types';

export type AnalysisContentProps = {
  loading: boolean;
  lines: unknown[];
  analysisTab: AnalysisTab;
  groups: ItemGroup[];
};
