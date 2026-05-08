import { CheckCircle2Icon, AlertTriangleIcon, InfoIcon, XCircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ReviewResult, InventoryType } from './review';
import { useImportReviewState } from './hooks/useImportReviewState';
import { StatusBadge } from './StatusBadge';
import { Section } from './Section';
import { ReviewRow } from './ReviewRow';
import { ParseWarnings } from './ParseWarnings';
import { SummaryCard } from './SummaryCard';

export type { InventoryType };

export interface ImportReviewProps {
  review: ReviewResult;
  onCommit: (review: ReviewResult) => void;
  onCancel: () => void;
  commitLabel?: string;
}

const inputClass = cn(
  'h-7 rounded border border-input bg-background px-2 text-xs',
  'focus:outline-none focus:ring-2 focus:ring-[var(--nav-active-border)]/50'
);

export function ImportReview({ review: initial, onCommit, onCancel, commitLabel = 'Commit to database' }: ImportReviewProps) {
  const {
    units,
    categories,
    items,
    goodTypes,
    typeWarningCount,
    selectedNew,
    existsCount,
    unresolvedCount,
    fixCategoryType,
    toggleUnit,
    toggleCategory,
    toggleItem,
    assignCategory,
    buildResult,
  } = useImportReviewState(initial);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <SummaryCard
          icon={<CheckCircle2Icon className="size-4 text-emerald-600" />}
          value={selectedNew}
          label="Will be added"
          color="emerald"
        />
        <SummaryCard
          icon={<InfoIcon className="size-4 text-muted-foreground" />}
          value={existsCount}
          label="Already exist"
          color="muted"
        />
        {unresolvedCount > 0 && (
          <SummaryCard
            icon={<XCircleIcon className="size-4 text-red-600" />}
            value={unresolvedCount}
            label="Need a category"
            color="red"
          />
        )}
      </div>

      {unresolvedCount > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex gap-3 text-sm">
          <AlertTriangleIcon className="size-4 shrink-0 text-amber-600 mt-0.5" />
          <div className="text-amber-800">
            <span className="font-medium">{unresolvedCount} item{unresolvedCount !== 1 ? 's have' : ' has'} a category that wasn't found.</span>{' '}
            Use the dropdown on each row to assign an existing category, or add the missing categories to your file and re-import.
          </div>
        </div>
      )}

      {initial.parseErrors.length > 0 && (
        <ParseWarnings errors={initial.parseErrors} />
      )}

      {units.length > 0 && (
        <Section title="Units of measure" count={units.length} defaultOpen={units.some((u) => u.status === 'new')}>
          {units.map((u) => (
            <ReviewRow
              key={u.name}
              selected={u.selected}
              onToggle={() => toggleUnit(u.name)}
              disabled={u.status === 'exists'}
            >
              <span className={cn('flex-1 font-medium', u.status === 'exists' && 'text-muted-foreground')}>
                {u.name}
              </span>
              <StatusBadge status={u.status} />
            </ReviewRow>
          ))}
        </Section>
      )}

      {typeWarningCount > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex gap-3 text-sm">
          <AlertTriangleIcon className="size-4 shrink-0 text-amber-600 mt-0.5" />
          <div className="text-amber-800">
            <span className="font-medium">
              {typeWarningCount} categor{typeWarningCount !== 1 ? 'ies have' : 'y has'} an unrecognised type.
            </span>{' '}
            Use the dropdown on each row to assign a valid type before committing.
          </div>
        </div>
      )}

      {categories.length > 0 && (
        <Section
          title="Categories"
          count={categories.length}
          defaultOpen={categories.some((c) => c.status === 'new')}
        >
          {categories.map((cat) => (
            <ReviewRow
              key={cat.id}
              selected={cat.selected}
              onToggle={() => toggleCategory(cat.id)}
              disabled={cat.status === 'exists'}
            >
              <div className="flex flex-1 items-center gap-3 min-w-0 flex-wrap">
                <span className={cn('font-medium truncate', cat.status === 'exists' && 'text-muted-foreground')}>
                  {cat.name}
                </span>
                {cat.typeWarning && cat.status !== 'exists' && goodTypes.length > 0 ? (
                  <select
                    value=""
                    onChange={(e) => { e.stopPropagation(); fixCategoryType(cat.id, e.target.value); }}
                    onClick={(e) => e.stopPropagation()}
                    className={cn(inputClass, 'cursor-pointer shrink-0 max-w-[180px] border-amber-400')}
                  >
                    <option value="" disabled>{cat.type} (unknown)</option>
                    {goodTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                ) : (
                  <span className="text-xs text-muted-foreground shrink-0">{cat.type}</span>
                )}
              </div>
              <StatusBadge status={cat.status} />
            </ReviewRow>
          ))}
        </Section>
      )}

      {items.length > 0 && (
        <Section
          title="Items"
          count={items.length}
          defaultOpen={items.some((i) => i.status !== 'exists')}
        >
          {items.map((item) => {
            const isUnresolved = item.status === 'unresolved';
            return (
              <ReviewRow
                key={item.name}
                selected={item.selected}
                onToggle={() => toggleItem(item.name)}
                disabled={item.status === 'exists' || isUnresolved}
              >
                <div className="flex flex-1 items-center gap-3 min-w-0 flex-wrap">
                  <span
                    className={cn(
                      'font-medium truncate',
                      (item.status === 'exists' || isUnresolved) && 'text-muted-foreground'
                    )}
                  >
                    {item.name}
                  </span>
                  {!isUnresolved && (
                    <span className="text-xs text-muted-foreground shrink-0 hidden sm:inline">
                      {[item.categoryName, item.unit].filter(Boolean).join(' · ')}
                    </span>
                  )}
                  {isUnresolved && (
                    <select
                      value=""
                      onChange={(e) => {
                        e.stopPropagation();
                        assignCategory(item.name, e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className={cn(inputClass, 'cursor-pointer shrink-0 max-w-[180px]')}
                    >
                      <option value="">Assign category…</option>
                      {initial.availableCategories.map((c) => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  )}
                </div>
                <StatusBadge status={item.status} />
              </ReviewRow>
            );
          })}
        </Section>
      )}

      <div className="flex items-center justify-between pt-1">
        <p className="text-xs text-muted-foreground">
          {selectedNew > 0
            ? `${selectedNew} row${selectedNew !== 1 ? 's' : ''} selected to import`
            : 'Nothing selected'}
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="success"
            size="sm"
            disabled={selectedNew === 0}
            onClick={() => onCommit(buildResult())}
          >
            {commitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
