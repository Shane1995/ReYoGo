import { useState } from 'react';
import { ScanSummaryDetails } from './components/ScanSummaryDetails';
import { ScanSummaryToggle } from './components/ScanSummaryToggle';
import type { ScanSummaryBarProps } from './types';

function countFlags(summary: ScanSummaryBarProps['summary']): number {
  return summary.reviewNotes.length + (summary.totalMismatch ? 1 : 0);
}

export function ScanSummaryBar({ summary, onDismiss }: ScanSummaryBarProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mx-4 mt-3 rounded-xl border border-[var(--nav-border)] bg-muted/40 p-3">
      <ScanSummaryToggle
        expanded={expanded}
        flagCount={countFlags(summary)}
        onToggle={() => setExpanded((v) => !v)}
        onDismiss={onDismiss}
      />
      {expanded && (
        <div className="mt-3">
          <ScanSummaryDetails summary={summary} />
        </div>
      )}
    </div>
  );
}
