import { useState, useCallback, useMemo } from 'react';
import {
  CheckCircle2Icon,
  AlertTriangleIcon,
  InfoIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ReviewResult, ReviewCategory, ReviewItem, ReviewUnit, InventoryType } from './review';

// Re-export InventoryType so consumers can import from here
export type { InventoryType };

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  new: {
    label: 'New',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2Icon,
  },
  exists: {
    label: 'Already exists',
    className: 'bg-muted text-muted-foreground border-[var(--nav-border)]',
    icon: InfoIcon,
  },
  unresolved: {
    label: 'No category',
    className: 'bg-red-50 text-red-700 border-red-200',
    icon: XCircleIcon,
  },
} as const;

function StatusBadge({ status }: { status: keyof typeof STATUS_CONFIG }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
        cfg.className
      )}
    >
      <Icon className="size-3 shrink-0" />
      {cfg.label}
    </span>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  count,
  defaultOpen = true,
  children,
}: {
  title: string;
  count: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-[var(--nav-border)] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{title}</span>
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-background border border-[var(--nav-border)] px-1.5 text-xs font-medium text-foreground">
            {count}
          </span>
        </div>
        {open ? (
          <ChevronDownIcon className="size-4 text-muted-foreground" />
        ) : (
          <ChevronRightIcon className="size-4 text-muted-foreground" />
        )}
      </button>
      {open && <div className="divide-y divide-[var(--nav-border)]">{children}</div>}
    </div>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function ReviewRow({
  selected,
  onToggle,
  disabled,
  children,
}: {
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 text-sm',
        disabled ? 'opacity-50' : 'hover:bg-muted/20 cursor-pointer'
      )}
      onClick={disabled ? undefined : onToggle}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggle}
        disabled={disabled}
        onClick={(e) => e.stopPropagation()}
        className="h-4 w-4 rounded border-[var(--nav-border)] text-[var(--nav-active-border)] cursor-pointer"
      />
      {children}
    </div>
  );
}

const inputClass = cn(
  'h-7 rounded border border-input bg-background px-2 text-xs',
  'focus:outline-none focus:ring-2 focus:ring-[var(--nav-active-border)]/50'
);

// ─── Main component ───────────────────────────────────────────────────────────

export interface ImportReviewProps {
  review: ReviewResult;
  onCommit: (review: ReviewResult) => void;
  onCancel: () => void;
  commitLabel?: string;
}

export function ImportReview({ review: initial, onCommit, onCancel, commitLabel = 'Commit to database' }: ImportReviewProps) {
  const [units, setUnits] = useState<ReviewUnit[]>(initial.units);
  const [categories, setCategories] = useState<ReviewCategory[]>(initial.categories);
  const [items, setItems] = useState<ReviewItem[]>(initial.items);

  const goodTypes = initial.goodTypes ?? [];
  const typeWarningCount = useMemo(
    () => categories.filter((c) => c.typeWarning && c.status !== 'exists').length,
    [categories]
  );

  const fixCategoryType = useCallback((id: string, type: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, type, typeWarning: false } : c))
    );
  }, []);

  // ── Toggle helpers ──────────────────────────────────────────────────────────
  const toggleUnit = useCallback((name: string) => {
    setUnits((prev) =>
      prev.map((u) => (u.name === name && u.status !== 'exists' ? { ...u, selected: !u.selected } : u))
    );
  }, []);

  const toggleCategory = useCallback((id: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id && c.status !== 'exists' ? { ...c, selected: !c.selected } : c))
    );
  }, []);

  const toggleItem = useCallback((name: string) => {
    setItems((prev) =>
      prev.map((i) => (i.name === name && i.status === 'new' ? { ...i, selected: !i.selected } : i))
    );
  }, []);

  // Assign a category to an unresolved item — promotes it to 'new'
  const assignCategory = useCallback((itemName: string, catName: string) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.name !== itemName) return i;
        if (catName) {
          return { ...i, categoryName: catName, status: 'new', selected: true };
        }
        // Clear — restore original unresolved state
        const original = initial.items.find((ii) => ii.name === itemName);
        return {
          ...i,
          categoryName: original?.unresolvedReason ?? i.categoryName,
          status: 'unresolved',
          selected: false,
        };
      })
    );
  }, [initial.items]);

  // ── Summary bar ─────────────────────────────────────────────────────────────
  const selectedNew =
    units.filter((u) => u.selected && u.status === 'new').length +
    categories.filter((c) => c.selected && c.status === 'new').length +
    items.filter((i) => i.selected && i.status === 'new').length;

  const existsCount =
    units.filter((u) => u.status === 'exists').length +
    categories.filter((c) => c.status === 'exists').length +
    items.filter((i) => i.status === 'exists').length;

  const unresolvedCount = items.filter((i) => i.status === 'unresolved').length;

  return (
    <div className="flex flex-col gap-4">
      {/* Summary bar */}
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

      {/* Unresolved explanation */}
      {unresolvedCount > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex gap-3 text-sm">
          <AlertTriangleIcon className="size-4 shrink-0 text-amber-600 mt-0.5" />
          <div className="text-amber-800">
            <span className="font-medium">{unresolvedCount} item{unresolvedCount !== 1 ? 's have' : ' has'} a category that wasn't found.</span>{' '}
            Use the dropdown on each row to assign an existing category, or add the missing categories to your file and re-import.
          </div>
        </div>
      )}

      {/* Parse errors */}
      {initial.parseErrors.length > 0 && (
        <ParseWarnings errors={initial.parseErrors} />
      )}

      {/* Units section */}
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

      {/* Type warning banner */}
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

      {/* Categories section */}
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

      {/* Items section */}
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

      {/* Footer actions */}
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
            onClick={() => onCommit({ units, categories, items, parseErrors: initial.parseErrors, availableCategories: initial.availableCategories, goodTypes: initial.goodTypes, counts: initial.counts })}
          >
            {commitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Parse warnings ───────────────────────────────────────────────────────────

function ParseWarnings({ errors }: { errors: string[] }) {
  const [open, setOpen] = useState(false);

  // Group by pattern: "Sheet row N: <message>"
  // Deduplicate by message content to show "X rows affected" summaries
  const groups = errors.reduce<Map<string, number>>((acc, err) => {
    // Strip row number to get the core message e.g. "unknown type "material", defaulted to "food""
    const core = err.replace(/^[^:]+:\s*/, '');
    acc.set(core, (acc.get(core) ?? 0) + 1);
    return acc;
  }, new Map());

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-amber-100/50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <AlertTriangleIcon className="size-4 shrink-0 text-amber-600" />
          <span className="text-sm font-medium text-amber-800">
            {groups.size} import warning{groups.size !== 1 ? 's' : ''}
          </span>
          <span className="text-xs text-amber-600">
            — values were adjusted to match expected format
          </span>
        </div>
        {open
          ? <ChevronDownIcon className="size-4 text-amber-500 shrink-0" />
          : <ChevronRightIcon className="size-4 text-amber-500 shrink-0" />}
      </button>
      {open && (
        <div className="border-t border-amber-200 divide-y divide-amber-100">
          {Array.from(groups.entries()).map(([msg, count]) => (
            <div key={msg} className="flex items-center justify-between px-4 py-2 gap-4">
              <span className="text-xs text-amber-800">{msg}</span>
              <span className="shrink-0 text-xs font-medium text-amber-600 bg-amber-100 border border-amber-200 rounded-full px-2 py-0.5">
                {count} row{count !== 1 ? 's' : ''}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: 'emerald' | 'muted' | 'amber' | 'red';
}) {
  const bg = {
    emerald: 'bg-emerald-50 border-emerald-200',
    muted: 'bg-muted/40 border-[var(--nav-border)]',
    amber: 'bg-amber-50 border-amber-200',
    red: 'bg-red-50 border-red-200',
  }[color];

  return (
    <div className={cn('rounded-lg border px-3 py-2.5 flex items-center gap-2.5', bg)}>
      {icon}
      <div>
        <div className="text-lg font-bold text-foreground leading-none">{value}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
      </div>
    </div>
  );
}
