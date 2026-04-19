import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { STEP_LABELS } from "../utils/types";
import type { Step } from "../utils/types";

export function StepIndicator({ current }: { current: Step }) {
  const visible: Step[] = ["good-types", "units", "categories", "items"];
  return (
    <div className="flex items-center gap-2">
      {visible.map((step, i) => {
        const currentIdx = visible.indexOf(current as Step);
        const isDone = currentIdx > i;
        const isActive = current === step;
        return (
          <div key={step} className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                isDone && "bg-[var(--nav-active-border)] text-white",
                isActive && "bg-[var(--nav-active-border)] text-white",
                !isDone && !isActive && "border border-[var(--nav-border)] text-muted-foreground bg-background"
              )}
            >
              {isDone ? <CheckIcon className="size-3.5" /> : i + 1}
            </div>
            <span
              className={cn(
                "text-sm",
                isActive ? "font-medium text-foreground" : "text-muted-foreground"
              )}
            >
              {STEP_LABELS[step]}
            </span>
            {i < visible.length - 1 && (
              <div
                className={cn(
                  "mx-1 h-px w-8",
                  isDone ? "bg-[var(--nav-active-border)]" : "bg-[var(--nav-border)]"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
