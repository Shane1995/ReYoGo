import { CopyIcon, XIcon } from "lucide-react";

type Props = {
  onDismiss: () => void;
};

export function ReuseNotice({ onDismiss }: Props) {
  return (
    <div className="shrink-0 flex items-center gap-2 border-b border-[var(--nav-border)] bg-muted/40 px-4 py-2 text-sm text-muted-foreground">
      <CopyIcon className="size-3.5 shrink-0" />
      <span>Items pre-filled from a previous invoice — add quantity and price to continue.</span>
      <button
        type="button"
        onClick={onDismiss}
        className="ml-auto text-muted-foreground hover:text-foreground"
        aria-label="Dismiss"
      >
        <XIcon className="size-3.5" />
      </button>
    </div>
  );
}
