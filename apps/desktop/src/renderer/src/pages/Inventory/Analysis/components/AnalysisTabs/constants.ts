import type { AnalysisTab } from '../../hooks/useAnalysisData';

export const TAB_LABELS: { key: AnalysisTab; label: string }[] = [
  { key: 'all', label: 'All items' },
  { key: 'by-type', label: 'By type' },
  { key: 'by-category', label: 'By category' },
];
