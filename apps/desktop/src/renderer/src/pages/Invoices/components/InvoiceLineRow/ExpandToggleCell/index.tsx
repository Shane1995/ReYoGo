import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import { TableCell, cn } from '@reyogo/ui';

export function ExpandToggleCell({
  isExpanded,
  onToggle,
}: {
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <TableCell className="w-8 p-2 align-middle">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'rounded p-0.5 -m-0.5 transition-colors',
          isExpanded ? 'text-primary' : 'text-muted-foreground/40 hover:text-muted-foreground',
        )}
        aria-expanded={isExpanded}
        aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
      >
        {isExpanded ? (
          <ChevronDownIcon className="size-3.5" aria-hidden />
        ) : (
          <ChevronRightIcon className="size-3.5" aria-hidden />
        )}
      </button>
    </TableCell>
  );
}
