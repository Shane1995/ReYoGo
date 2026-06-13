import { ReceiptIcon, Trash2Icon, XIcon } from 'lucide-react';
import { Button } from '@reyogo/ui';
import type { DefaultActionsProps } from './types';

export function DefaultActions({ onAddToInvoice, onRequestDelete, onClear }: DefaultActionsProps) {
  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-7 gap-1.5 text-xs text-primary hover:bg-primary/10 hover:text-primary"
        onClick={onAddToInvoice}
      >
        <ReceiptIcon className="size-3" />
        Add to invoice
      </Button>
      <div className="h-3 w-px bg-border" />
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-7 gap-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
        onClick={onRequestDelete}
      >
        <Trash2Icon className="size-3" />
        Archive
      </Button>
      <button
        type="button"
        onClick={onClear}
        className="ml-auto flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
      >
        <XIcon className="size-3" />
        Clear
      </button>
    </>
  );
}
