import { useState } from 'react';
import { CheckIcon, ChevronDownIcon, ChevronsUpDownIcon, UserIcon } from 'lucide-react';
import { cn } from '@reyogo/ui';
import { Popover, PopoverContent, PopoverTrigger } from '@reyogo/ui';
import { useEntities } from '@/Context/EntityContext';

function entityInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

const ENTITY_COLORS = [
  { bg: 'bg-[#20C997]/20', text: 'text-[#20C997]', ring: 'ring-[#20C997]/30' },
  { bg: 'bg-[#0EA5E9]/20', text: 'text-[#0EA5E9]', ring: 'ring-[#0EA5E9]/30' },
  { bg: 'bg-[#FD7E14]/20', text: 'text-[#FD7E14]', ring: 'ring-[#FD7E14]/30' },
  { bg: 'bg-[#E63946]/20', text: 'text-[#E63946]', ring: 'ring-[#E63946]/30' },
  { bg: 'bg-violet-500/20', text: 'text-violet-400', ring: 'ring-violet-500/30' },
];

function entityColor(id: string) {
  const idx = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % ENTITY_COLORS.length;
  return ENTITY_COLORS[idx] ?? ENTITY_COLORS[0]!;
}

const barStyle: React.CSSProperties = {
  background: 'rgba(13,17,23,0.92)',
  backdropFilter: 'blur(28px) saturate(200%)',
  boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.06)',
};

type Entity = { id: string; name: string };

function EntityAvatar({ id, name }: Entity) {
  const c = entityColor(id);
  return (
    <span
      className={cn(
        'flex size-5 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold ring-1',
        c.bg,
        c.text,
        c.ring,
      )}
    >
      {entityInitials(name)}
    </span>
  );
}

function EntitySwitcherList({
  entities,
  selectedEntityId,
  onSelect,
}: {
  entities: Entity[];
  selectedEntityId: string | undefined;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="mt-1 space-y-0.5">
      {entities.map((entity) => {
        const isActive = entity.id === selectedEntityId;
        return (
          <button
            key={entity.id}
            type="button"
            onClick={() => onSelect(entity.id)}
            className={cn(
              'flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-xs transition-colors',
              isActive
                ? 'bg-[var(--nav-accent)] text-[var(--nav-accent-foreground)]'
                : 'text-foreground hover:bg-muted/60',
            )}
          >
            <EntityAvatar id={entity.id} name={entity.name} />
            <span className="flex-1 truncate font-medium">{entity.name}</span>
            {isActive && <CheckIcon className="size-3 shrink-0 text-[#20C997]" />}
          </button>
        );
      })}
    </div>
  );
}

function EntitySwitcherPopover({
  entities,
  selectedEntityId,
  open,
  onOpenChange,
  onSelect,
}: {
  entities: Entity[];
  selectedEntityId: string | undefined;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSelect: (id: string) => void;
}) {
  const selected = entities.find((e) => e.id === selectedEntityId) ?? entities[0]!;
  const color = entityColor(selected.id);
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
          <span
            className={cn(
              'flex size-5 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold ring-1',
              color.bg,
              color.text,
              color.ring,
            )}
          >
            {entityInitials(selected.name)}
          </span>
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

function AccountButton() {
  return (
    <div className="flex h-7 items-center gap-2 rounded-md px-2 text-xs text-white/50 hover:bg-white/8 hover:text-white/75 transition-colors cursor-default">
      <span className="flex size-5 items-center justify-center rounded-full bg-gradient-to-br from-[#20C997]/30 to-[#0EA5E9]/20 ring-1 ring-white/10">
        <UserIcon className="size-3 text-white/60" />
      </span>
      <span className="font-medium">Account</span>
      <ChevronDownIcon className="size-3 text-white/25" />
    </div>
  );
}

export function EntityTopBar() {
  const { group, entities, selectedEntityId, setSelectedEntityId } = useEntities();
  const [open, setOpen] = useState(false);

  const selectedEntity = entities.find((e) => e.id === selectedEntityId) ?? entities[0];
  const hasMultiple = entities.length > 1;
  const color = selectedEntity ? entityColor(selectedEntity.id) : ENTITY_COLORS[0]!;

  return (
    <div className="shrink-0 flex items-center h-[52px] px-3 gap-3" style={barStyle}>
      <div className="flex items-center gap-2.5 shrink-0">
        <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="ReYoGo" className="size-6 shrink-0" />
        <span className="text-sm font-semibold leading-none text-white">ReYoGo</span>
        {group?.name && (
          <>
            <span className="text-white/15 text-xs">·</span>
            <span className="text-xs font-medium text-white/45 max-w-[160px] truncate">
              {group.name}
            </span>
          </>
        )}
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-1.5">
        {selectedEntity &&
          (hasMultiple ? (
            <EntitySwitcherPopover
              entities={entities}
              selectedEntityId={selectedEntityId}
              open={open}
              onOpenChange={setOpen}
              onSelect={(id) => {
                setSelectedEntityId(id);
                setOpen(false);
              }}
            />
          ) : (
            <div className="flex h-7 items-center gap-2 px-2">
              <span
                className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold ring-1',
                  color.bg,
                  color.text,
                  color.ring,
                )}
              >
                {entityInitials(selectedEntity.name)}
              </span>
              <span className="text-xs font-medium text-white/60">{selectedEntity.name}</span>
            </div>
          ))}
        <div className="mx-0.5 h-4 w-px bg-white/10" />
        <AccountButton />
      </div>
    </div>
  );
}
