import type { ReportView } from '../../types';

export type ReportTabsProps = {
  activeView: ReportView;
  setActiveView: (view: ReportView) => void;
};
