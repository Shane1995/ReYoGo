import { Button, StatCard, cn } from '@reyogo/ui';
import { ClipboardCheckIcon, LayersIcon, SearchIcon, WalletIcon } from 'lucide-react';
import { formatZAR } from '@/utils/format';
import { CountSheetTable } from '../CountSheetTable';
import type { ActiveSessionPanelProps } from './types';

export function ActiveSessionPanel({
  buckets,
  readOnly,
  onQtyChange,
  summary,
  search,
  onSearchChange,
  saving,
  completing,
  lines,
  onSaveDraft,
  onCompleteClick,
}: ActiveSessionPanelProps) {
  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Items counted"
          value={`${summary.countedCount} / ${summary.totalCount}`}
          icon={ClipboardCheckIcon}
        />
        <StatCard label="Categories" value={summary.categoryCount} icon={LayersIcon} />
        <StatCard label="Counted value" value={formatZAR(summary.totalValue)} icon={WalletIcon} />
      </div>
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50 pointer-events-none" />
        <input
          type="search"
          placeholder="Search items…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn(
            'h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm',
            'placeholder:text-muted-foreground/50',
          )}
        />
      </div>
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <CountSheetTable buckets={buckets} readOnly={readOnly} onQtyChange={onQtyChange} />
      </div>
      {!readOnly && (
        <div className="flex gap-2">
          <Button variant="outline" disabled={saving} onClick={() => onSaveDraft(lines)}>
            {saving ? 'Saving…' : 'Save Progress'}
          </Button>
          <Button disabled={completing} onClick={onCompleteClick}>
            Complete Count
          </Button>
        </div>
      )}
    </>
  );
}
