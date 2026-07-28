import {
  TableCell,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  cn,
} from '@reyogo/ui';

import type { VatToggleCellProps } from './types';

function vatToggleTitle(isVatable: boolean): string {
  return isVatable ? 'Taxable — click to exempt' : 'Exempt — click to make taxable';
}

function vatToggleClass(isVatable: boolean, needsReview: boolean): string {
  return cn(
    'inline-flex items-center justify-center size-5 rounded border transition-all',
    isVatable
      ? 'bg-primary border-primary text-primary-foreground'
      : 'bg-background border-input text-transparent hover:border-primary/50',
    needsReview && 'ring-1 ring-amber-500 ring-offset-1',
  );
}

export function VatToggleCell({
  lineId,
  isVatable,
  needsReview = false,
  onToggle,
}: VatToggleCellProps) {
  const button = (
    <button
      id={`invoice-vat-${lineId}`}
      type="button"
      role="checkbox"
      aria-checked={isVatable}
      onClick={onToggle}
      title={vatToggleTitle(isVatable)}
      className={vatToggleClass(isVatable, needsReview)}
    >
      <svg viewBox="0 0 10 8" className="size-2.5 fill-current" aria-hidden>
        <path
          d="M1 4l3 3 5-6"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );

  if (!needsReview) return <TableCell className="py-2 px-3 text-center">{button}</TableCell>;

  return (
    <TableCell className="py-2 px-3 text-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>
            Claude read this line as tax-exempt on the document — worth confirming
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </TableCell>
  );
}
