import { PencilIcon, Trash2Icon, LineChartIcon } from "lucide-react";
import type { InventoryItem } from "../../../types";
import type { FlatItem } from "../types";

type Props = {
  row: FlatItem;
  originalItem: InventoryItem;
  confirmDeleteId: string | null;
  onEdit: (item: InventoryItem) => void;
  onViewInsights: (id: string) => void;
  onRequestDelete: (id: string) => void;
  onCancelDelete: () => void;
  onConfirmDelete: (id: string) => void;
};

export function ItemRowActions({
  row,
  originalItem,
  confirmDeleteId,
  onEdit,
  onViewInsights,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}: Props) {
  if (confirmDeleteId === row.id) {
    return (
      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={() => onConfirmDelete(row.id)}
          className="rounded px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          Delete
        </button>
        <button
          type="button"
          onClick={onCancelDelete}
          className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        title="View cost insights"
        onClick={() => onViewInsights(row.id)}
        className="flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <LineChartIcon className="size-3.5" />
      </button>
      <button
        type="button"
        title="Edit item"
        onClick={() => onEdit(originalItem)}
        className="flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <PencilIcon className="size-3.5" />
      </button>
      <button
        type="button"
        title="Delete item"
        onClick={() => onRequestDelete(row.id)}
        className="flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
      >
        <Trash2Icon className="size-3.5" />
      </button>
    </div>
  );
}
