import { cn } from '@reyogo/ui';
import { REPORT_VIEW_LABELS } from '../../constants';
import type { ReportTabsProps } from './types';

export function ReportTabs({ activeView, setActiveView }: ReportTabsProps) {
  return (
    <div className="shrink-0 border-b border-[var(--nav-border)] bg-background px-6">
      <div className="flex gap-0">
        {REPORT_VIEW_LABELS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveView(key)}
            className={cn(
              'px-4 py-2.5 text-sm border-b-2 transition-colors',
              activeView === key
                ? 'border-[var(--nav-active-border)] text-foreground font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
