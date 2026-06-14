import type { AnalysisTab } from '../../hooks/useAnalysisData';

export type AnalysisTabsProps = {
  analysisTab: AnalysisTab;
  setAnalysisTab: (tab: AnalysisTab) => void;
};
