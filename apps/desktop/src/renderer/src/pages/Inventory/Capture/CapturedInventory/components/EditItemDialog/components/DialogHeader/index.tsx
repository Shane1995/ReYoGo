import { XIcon } from 'lucide-react';
import type { DialogHeaderProps } from './types';

export function DialogHeader({ isEdit, onClose }: DialogHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-border px-5 py-4">
      <h2 className="text-base font-semibold text-foreground">
        {isEdit ? 'Edit item' : 'Add item'}
      </h2>
      <button
        type="button"
        onClick={onClose}
        className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <XIcon className="size-4" />
      </button>
    </div>
  );
}
