import { useState } from 'react';
import { MoreHorizontalIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@reyogo/ui';
import { ActionsMenu } from './components/ActionsMenu';
import { ConfirmArchive } from './components/ConfirmArchive';
import type { ItemRowActionsProps } from './types';

export function ItemRowActions({
  row,
  originalItem,
  onEdit,
  onViewInsights,
  onDelete,
}: ItemRowActionsProps) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  function close() {
    setOpen(false);
    setConfirming(false);
  }

  return (
    <div className="flex justify-end">
      <Popover
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setConfirming(false);
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex size-7 items-center justify-center rounded text-muted-foreground/30 opacity-0 group-hover:opacity-100 hover:bg-muted hover:text-foreground transition-all"
            aria-label="Row actions"
          >
            <MoreHorizontalIcon className="size-3.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-40 p-1" align="end" sideOffset={4}>
          {confirming ? (
            <ConfirmArchive
              onConfirm={() => {
                onDelete(row.id);
                close();
              }}
              onCancel={() => setConfirming(false)}
            />
          ) : (
            <ActionsMenu
              onEdit={() => {
                onEdit(originalItem);
                close();
              }}
              onViewInsights={() => {
                onViewInsights(row.id);
                close();
              }}
              onArchive={() => setConfirming(true)}
            />
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
