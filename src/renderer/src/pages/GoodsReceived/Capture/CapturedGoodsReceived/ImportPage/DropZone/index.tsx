import { UploadIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type DropZoneProps = {
  onClick: () => void;
};

export function DropZone({ onClick }: DropZoneProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border-2 border-dashed border-[var(--nav-border)] p-12",
        "flex flex-col items-center gap-4 text-center",
        "hover:border-[var(--nav-active-border)] hover:bg-muted/20 transition-colors"
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--nav-bg)] border border-[var(--nav-border)]">
        <UploadIcon className="size-6 text-[var(--nav-active-border)]" />
      </div>
      <div>
        <p className="text-base font-semibold text-foreground">Choose a file to review</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Supports Excel (.xlsx) and CSV — nothing is saved until you confirm
        </p>
      </div>
    </button>
  );
}
