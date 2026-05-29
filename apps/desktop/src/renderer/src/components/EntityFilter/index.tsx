import { cn } from '@reyogo/ui';
import type { IEntity } from '@reyogo/types';

interface EntityFilterProps {
  entities: IEntity[];
  selected: string | null;
  onChange: (entityId: string | null) => void;
}

export function EntityFilter({ entities, selected, onChange }: EntityFilterProps) {
  if (entities.length <= 1) return null;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <button
        onClick={() => onChange(null)}
        className={cn(
          'rounded-full px-3 py-1 text-xs font-medium transition-colors',
          selected === null
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:text-foreground',
        )}
      >
        All
      </button>
      {entities.map((e) => (
        <button
          key={e.id}
          onClick={() => onChange(e.id)}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium transition-colors',
            selected === e.id
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground',
          )}
        >
          {e.name}
        </button>
      ))}
    </div>
  );
}
