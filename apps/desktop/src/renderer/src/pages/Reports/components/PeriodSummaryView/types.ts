import type { COGSSummary } from '@reyogo/types';

export type PeriodSummaryViewProps = {
  fromDate: string;
  toDate: string;
  entityId: string | undefined;
  onCogsChange: (cogs: COGSSummary | null) => void;
};
