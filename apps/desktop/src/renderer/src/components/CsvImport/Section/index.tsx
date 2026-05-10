import { useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react';

export function Section({
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
