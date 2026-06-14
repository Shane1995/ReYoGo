import { cn } from '@reyogo/ui';
import { TAB_LABELS } from './constants';
import type { AnalysisTabsProps } from './types';

export function AnalysisTabs({ analysisTab, setAnalysisTab }: AnalysisTabsProps) {
  return (
    <div className="shrink-0 border-b border-[var(--nav-border)] bg-background px-6">
      <div className="flex gap-0">
        {TAB_LABELS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setAnalysisTab(key)}
            className={cn(
              'px-4 py-2.5 text-sm border-b-2 transition-colors',
              analysisTab === key
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
