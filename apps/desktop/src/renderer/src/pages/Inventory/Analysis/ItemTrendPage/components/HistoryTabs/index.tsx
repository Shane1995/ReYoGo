import { useState } from 'react';
import { cn } from '@reyogo/ui';
import { TrendHistoryTable } from '../TrendHistoryTable';
import { FullHistoryTable } from '../FullHistoryTable';
import { HISTORY_VIEW_LABELS } from './constants';
import { HistoryView } from './types';
import type { HistoryTabsProps } from './types';

export function HistoryTabs({ entries, movements }: HistoryTabsProps) {
  const [view, setView] = useState<HistoryView>(HistoryView.PriceTrend);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-0 border-b border-[var(--nav-border)]">
        {HISTORY_VIEW_LABELS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setView(key)}
            className={cn(
              'px-4 py-2 text-sm border-b-2 transition-colors',
              view === key
                ? 'border-[var(--nav-active-border)] text-foreground font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {view === HistoryView.PriceTrend ? (
        <TrendHistoryTable entries={entries} />
      ) : (
        <FullHistoryTable movements={movements} />
      )}
    </div>
  );
}
