import { AlertTriangleIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@reyogo/ui';
import type { FieldReviewBadgeProps } from './types';

export function FieldReviewBadge({ message }: FieldReviewBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-amber-500">
            <AlertTriangleIcon className="size-3" />
          </span>
        </TooltipTrigger>
        <TooltipContent>{message}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
