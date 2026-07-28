import { ChevronDownIcon, ChevronUpIcon, SparklesIcon } from 'lucide-react';
import { DismissButton } from '../DismissButton';
import type { ScanSummaryToggleProps } from './types';

export function ScanSummaryToggle({
  expanded,
  flagCount,
  onToggle,
  onDismiss,
}: ScanSummaryToggleProps) {
  return (
    <button type="button" onClick={onToggle} className="flex w-full items-center gap-2 text-left">
      <SparklesIcon className="size-4 shrink-0 text-primary" />
      <span className="text-sm font-medium text-foreground">Invoice scanned</span>
      {flagCount > 0 && (
        <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-400">
          {flagCount} to review
        </span>
      )}
      <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
        {expanded ? 'Hide details' : 'View scan details'}
        {expanded ? (
          <ChevronUpIcon className="size-3.5" />
        ) : (
          <ChevronDownIcon className="size-3.5" />
        )}
      </span>
      <DismissButton onDismiss={onDismiss} />
    </button>
  );
}
