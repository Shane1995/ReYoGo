import { format, subDays, subMonths, startOfYear, startOfMonth, startOfWeek } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { cn } from '../lib/utils';

const STORE_FMT = 'yyyy-MM-dd';

function toStore(d: Date): string {
  return format(d, STORE_FMT);
}

export type Preset = { label: string; range: () => DateRange };

function isCompleteRange(from: string, to: string): boolean {
  if (!from) return false;
  return !!to;
}

function rangeBoundsOf(r: DateRange): { from: Date; to: Date } | null {
  if (!r.from) return null;
  if (!r.to) return null;
  return { from: r.from, to: r.to };
}

function isActivePreset(preset: Preset, from: string, to: string): boolean {
  if (!isCompleteRange(from, to)) return false;
  const bounds = rangeBoundsOf(preset.range());
  if (!bounds) return false;
  if (from !== toStore(bounds.from)) return false;
  return to === toStore(bounds.to);
}

const PRESET_GROUPS: { label: string; presets: Preset[] }[] = [
  {
    label: 'Relative',
    presets: [
      { label: 'Last 7 days', range: () => ({ from: subDays(new Date(), 6), to: new Date() }) },
      { label: 'Last 30 days', range: () => ({ from: subDays(new Date(), 29), to: new Date() }) },
      { label: 'Last 3 months', range: () => ({ from: subMonths(new Date(), 3), to: new Date() }) },
      { label: 'Last 6 months', range: () => ({ from: subMonths(new Date(), 6), to: new Date() }) },
    ],
  },
  {
    label: 'This period',
    presets: [
      {
        label: 'This week',
        range: () => ({ from: startOfWeek(new Date(), { weekStartsOn: 1 }), to: new Date() }),
      },
      { label: 'This month', range: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
      { label: 'This year', range: () => ({ from: startOfYear(new Date()), to: new Date() }) },
    ],
  },
];

type PresetListProps = {
  from: string;
  to: string;
  hasRange: boolean;
  onApplyPreset: (preset: Preset) => void;
  onClear: () => void;
};

export function PresetList({ from, to, hasRange, onApplyPreset, onClear }: PresetListProps) {
  return (
    <div className="flex w-44 flex-col bg-muted/20 py-2">
      {PRESET_GROUPS.map((group, gi) => (
        <div key={group.label}>
          {gi > 0 && <div className="mx-3 my-1.5 border-t border-[var(--nav-border)]/60" />}
          <p className="px-3 pb-1 pt-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/40 select-none">
            {group.label}
          </p>
          {group.presets.map((p) => {
            const active = isActivePreset(p, from, to);
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => onApplyPreset(p)}
                className={cn(
                  'w-full text-left px-3 py-1.5 text-sm transition-colors',
                  active
                    ? 'text-primary font-medium bg-primary/8'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                )}
              >
                {active && (
                  <span className="mr-1.5 inline-block size-1.5 rounded-full bg-primary align-middle mb-0.5" />
                )}
                {p.label}
              </button>
            );
          })}
        </div>
      ))}

      {hasRange && (
        <div className="mt-auto">
          <div className="mx-3 my-1.5 border-t border-[var(--nav-border)]/60" />
          <button
            type="button"
            onClick={onClear}
            className="w-full text-left px-3 py-1.5 text-sm text-destructive/60 hover:text-destructive hover:bg-destructive/5 transition-colors"
          >
            Clear range
          </button>
        </div>
      )}
    </div>
  );
}
