import { ScanTextIcon } from 'lucide-react';
import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@reyogo/ui';
import type { ScanInvoiceButtonProps } from './types';

export function ScanInvoiceButton({ configured, onClick }: ScanInvoiceButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={configured ? -1 : 0}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClick}
              disabled={!configured}
              className="gap-1.5"
            >
              <ScanTextIcon className="size-3.5" />
              Scan invoice
            </Button>
          </span>
        </TooltipTrigger>
        {!configured && <TooltipContent>Add your Anthropic key in Settings → AI</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
}
