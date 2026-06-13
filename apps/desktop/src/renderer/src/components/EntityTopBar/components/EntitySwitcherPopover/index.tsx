import { ChevronsUpDownIcon } from 'lucide-react';
import { cn, Popover, PopoverContent, PopoverTrigger } from '@reyogo/ui';
import { EntityAvatar } from '../EntityAvatar';
import { EntitySwitcherList } from '../EntitySwitcherList';
import type { EntitySwitcherPopoverProps } from './types';

export function EntitySwitcherPopover({
  entities,
  selectedEntityId,
  open,
  onOpenChange,
  onSelect,
}: EntitySwitcherPopoverProps) {
  const selected = entities.find((e) => e.id === selectedEntityId) ?? entities[0]!;
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'group flex h-7 items-center gap-2 rounded-md px-2 transition-colors',
            'hover:bg-white/8 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#20C997]/60',
            open && 'bg-white/8',
          )}
        >
          <EntityAvatar id={selected.id} name={selected.name} />
          <span className="max-w-[160px] truncate text-xs font-medium text-white/80">
            {selected.name}
          </span>
          <ChevronsUpDownIcon className="size-3 shrink-0 text-white/30 transition-colors group-hover:text-white/50" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={6} className="w-52 p-1.5">
        <p className="mb-1 px-2 pt-0.5 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 border-b border-border">
          Switch business
        </p>
        <EntitySwitcherList
          entities={entities}
          selectedEntityId={selectedEntityId}
          onSelect={onSelect}
        />
      </PopoverContent>
    </Popover>
  );
}
