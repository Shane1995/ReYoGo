import { Spinner } from "@/components/ui/spinner";

export function LoadingSpinner() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-5 bg-background">
      <img
        src="/logo.svg"
        alt="ReYoGo"
        className="size-16 animate-pulse"
        draggable={false}
      />
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-base font-semibold tracking-tight text-foreground">ReYoGo</span>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner className="size-3.5" />
          <span>Loading…</span>
        </div>
      </div>
    </div>
  );
}
