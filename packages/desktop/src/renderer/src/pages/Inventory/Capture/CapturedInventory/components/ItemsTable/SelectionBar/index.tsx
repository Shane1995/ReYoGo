import { ReceiptIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  selectedCount: number;
  confirmBulkDelete: boolean;
  onAddToInvoice: () => void;
  onRequestDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  onClear: () => void;
};

export function SelectionBar({
  selectedCount,
  confirmBulkDelete,
  onAddToInvoice,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
  onClear,
}: Props) {
  return (
    <div className="mb-2 flex items-center gap-3 rounded-lg border border-primary/20 bg-secondary px-3 py-1.5">
      <span className="text-xs font-medium text-secondary-foreground">
        {selectedCount} item{selectedCount !== 1 ? "s" : ""} selected
      </span>
      <div className="h-3 w-px bg-border" />
      {confirmBulkDelete ? (
        <>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            className="h-7 text-xs"
            onClick={onConfirmDelete}
          >
            Confirm — delete {selectedCount}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-muted-foreground hover:text-secondary-foreground"
            onClick={onCancelDelete}
          >
            Cancel
          </Button>
        </>
      ) : (
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
            className="h-7 gap-1.5 text-xs text-primary hover:bg-primary/10 hover:text-primary"
            onClick={onRequestDelete}
          >
            <Trash2Icon className="size-3" />
            Delete selected
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-muted-foreground hover:text-secondary-foreground"
            onClick={onClear}
          >
            Clear
          </Button>
        </>
      )}
    </div>
  );
}
