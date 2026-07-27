import type { COGSSummary } from '@reyogo/types';

export type PeriodSummaryViewProps = {
  fromDate: string;
  toDate: string;
  entityId: string | undefined;
  selectedCategories: string[];
  selectedType: string;
  onCogsChange: (cogs: COGSSummary | null) => void;
  onAvailableCategoriesChange: (categories: string[]) => void;
  onAvailableTypesChange: (types: string[]) => void;
};
