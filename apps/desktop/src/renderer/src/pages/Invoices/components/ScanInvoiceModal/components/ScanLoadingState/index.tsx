import { Spinner } from '@reyogo/ui';

export function ScanLoadingState() {
  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <Spinner className="size-8" />
      <div>
        <p className="text-base font-semibold text-foreground">Reading your invoice…</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Claude is extracting the supplier, date, and line items. This usually takes a few seconds.
        </p>
      </div>
    </div>
  );
}
