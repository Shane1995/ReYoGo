import type { InvoiceLineWithDate } from '@reyogo/types';
import type { AnalysisTab, ItemGroup } from '../../types';

export type AnalysisContentProps = {
  loading: boolean;
  lines: InvoiceLineWithDate[];
  analysisTab: AnalysisTab;
  groups: ItemGroup[];
};
