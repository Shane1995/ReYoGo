import { CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { IUnitOfMeasure } from "@shared/types/contract/setup";
import type { PendingCategory, PendingItem } from "../utils/types";

export function DoneStep({
  goodTypes,
  units,
  categories,
  items,
  onFinish,
  saving,
}: {
  goodTypes: string[];
  units: IUnitOfMeasure[];
  categories: PendingCategory[];
  items: PendingItem[];
  onFinish: () => void;
  saving: boolean;
}) {
  const validCategories = categories.filter((c) => c.name.trim()).length;
  const validItems = items.filter((i) => i.name.trim() && i.categoryId).length;

  return (
    <div className="flex flex-col items-center text-center gap-6 py-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--nav-bg)] border border-[var(--nav-border)]">
        <CheckIcon className="size-8 text-[var(--nav-active-border)]" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">You're all set!</h2>
        <p className="text-muted-foreground max-w-sm">
          Your inventory system is ready to go. Here's a summary of what was configured.
        </p>
      </div>
      <div className="grid grid-cols-4 gap-3 w-full">
        {[
          { count: goodTypes.length, label: "Types" },
          { count: units.length, label: "Units" },
          { count: validCategories, label: "Categories" },
          { count: validItems, label: "Items" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-[var(--nav-border)] bg-[var(--nav-bg)] px-4 py-3"
          >
            <div className="text-2xl font-bold text-[var(--nav-active-border)]">{s.count}</div>
            <div className="text-sm text-[var(--nav-foreground-muted)]">{s.label}</div>
          </div>
        ))}
      </div>
      <Button onClick={onFinish} disabled={saving} className="min-w-[10rem]">
        {saving ? "Saving…" : "Start using ReYoGo"}
      </Button>
    </div>
  );
}
