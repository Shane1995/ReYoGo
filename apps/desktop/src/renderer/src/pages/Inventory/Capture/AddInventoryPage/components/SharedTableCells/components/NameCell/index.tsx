import { TableCell, cn } from '@reyogo/ui';
import { inputClass } from '../../constants';
import type { NameCellProps } from './types';

export function NameCell({ id, value, isDupe, placeholder, onChange, onEnter }: NameCellProps) {
  return (
    <TableCell className="py-2 px-3">
      <div className="flex items-center gap-2">
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onEnter();
          }}
          className={cn(
            inputClass,
            'min-w-[10rem]',
            isDupe && 'border-destructive focus:ring-destructive/50',
          )}
          placeholder={placeholder}
        />
        {isDupe && <span className="shrink-0 text-xs text-destructive">Already exists</span>}
      </div>
    </TableCell>
  );
}
