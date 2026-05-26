import { useState } from 'react';
import { MoreHorizontalIcon, PencilIcon, Trash2Icon, LineChartIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@reyogo/ui';
import type { InventoryItem } from '../../../types';
import type { FlatItem } from '../types';

type Props = {
  row: FlatItem;
  originalItem: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onViewInsights: (id: string) => void;
  onDelete: (id: string) => void;
};

export function ItemRowActions({ row, originalItem, onEdit, onViewInsights, onDelete }: Props) {
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
            className="flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Row actions"
          >
            <MoreHorizontalIcon className="size-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-40 p-1" align="end" sideOffset={4}>
          {confirming ? (
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              <p className="mb-2 font-medium text-foreground">Delete this item?</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onDelete(row.id);
                    close();
                  }}
                  className="rounded px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="rounded px-2 py-1 text-xs hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => {
                  onEdit(originalItem);
                  close();
                }}
                className="flex items-center gap-2 rounded px-2 py-1.5 text-sm text-left hover:bg-muted transition-colors"
              >
                <PencilIcon className="size-3.5 text-muted-foreground" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  onViewInsights(row.id);
                  close();
                }}
                className="flex items-center gap-2 rounded px-2 py-1.5 text-sm text-left hover:bg-muted transition-colors"
              >
                <LineChartIcon className="size-3.5 text-muted-foreground" />
                Cost insights
              </button>
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="flex items-center gap-2 rounded px-2 py-1.5 text-sm text-left text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2Icon className="size-3.5" />
                Delete
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
