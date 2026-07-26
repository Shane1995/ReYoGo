import type { ReportView } from '../../types';

export type ReportPickerProps = {
  activeView: ReportView;
  setActiveView: (view: ReportView) => void;
};
