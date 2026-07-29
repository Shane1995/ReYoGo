import { AlertTriangleIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, cn } from '@reyogo/ui';
import type { FieldReviewIconProps } from './types';

export function FieldReviewIcon({ message, className }: FieldReviewIconProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn('absolute top-1/2 -translate-y-1/2 text-amber-500', className)}>
            <AlertTriangleIcon className="size-3.5" />
          </span>
        </TooltipTrigger>
        <TooltipContent>{message}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
