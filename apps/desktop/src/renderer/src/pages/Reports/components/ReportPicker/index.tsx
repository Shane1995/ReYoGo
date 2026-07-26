import { cn } from '@reyogo/ui';
import {
  fieldLabel,
  selectClass,
} from '@/pages/Inventory/Analysis/components/AnalysisFilters/constants';
import { REPORT_VIEW_LABELS } from '../../constants';
import type { ReportView } from '../../types';
import type { ReportPickerProps } from './types';

function isReportView(value: string): value is ReportView {
  return REPORT_VIEW_LABELS.some((option) => option.key === value);
}

export function ReportPicker({ activeView, setActiveView }: ReportPickerProps) {
  return (
    <div className="flex flex-col">
      <label className={fieldLabel}>Report</label>
      <select
        value={activeView}
        onChange={(e) => {
          if (isReportView(e.target.value)) setActiveView(e.target.value);
        }}
        className={cn(selectClass, 'w-56')}
      >
        {REPORT_VIEW_LABELS.map(({ key, label }) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
