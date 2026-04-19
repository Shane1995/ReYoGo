import { PackageIcon, DownloadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CsvImportButton, downloadTemplate } from "@/components/CsvImport";
import type { ReviewResult } from "@/components/CsvImport/review";
import { setupService } from "@/services/setup";

export function WelcomeStep({
  onNext,
  onImport,
}: {
  onNext: () => void;
  onImport: (parsed: unknown, review: ReviewResult) => void;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-6 py-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--nav-bg)] border border-[var(--nav-border)]">
        <PackageIcon className="size-8 text-[var(--nav-active-border)]" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Welcome to ReYoGo</h1>
        <p className="text-muted-foreground max-w-sm">
          Set up your inventory system manually step by step, or import everything at once from an
          Excel or CSV file.
        </p>
      </div>
      <div className="flex flex-col gap-2 text-sm text-muted-foreground w-full max-w-xs">
        {[
          { icon: "1", label: "Configure your good types" },
          { icon: "2", label: "Set up your units of measure" },
          { icon: "3", label: "Create inventory categories" },
          { icon: "4", label: "Add your inventory items" },
        ].map((item) => (
          <div key={item.icon} className="flex items-center gap-3 text-left">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--nav-bg)] border border-[var(--nav-border)] text-xs font-semibold text-[var(--nav-foreground)]">
              {item.icon}
            </div>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center gap-2 w-full max-w-xs">
        <Button onClick={onNext} className="w-full">
          Set up manually
        </Button>
        <div className="flex items-center gap-3 w-full">
          <div className="h-px flex-1 bg-[var(--nav-border)]" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-[var(--nav-border)]" />
        </div>
        <CsvImportButton
          onImport={(parsed, review) => {
            onImport(parsed, review);
            onNext();
          }}
          label="Import from Excel / CSV"
          variant="outline"
          size="default"
          className="w-full justify-center"
        />
        <button
          type="button"
          onClick={async () => {
            const types = await setupService.getGoodTypes();
            downloadTemplate(types);
          }}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <DownloadIcon className="size-3.5" />
          Download Excel template
        </button>
      </div>
    </div>
  );
}
