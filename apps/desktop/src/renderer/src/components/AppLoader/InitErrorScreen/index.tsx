import { hintFor } from './utils/hintFor';
import type { InitErrorScreenProps } from './types';

export function InitErrorScreen({ error }: InitErrorScreenProps) {
  const hint = hintFor(error);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4 bg-background p-8">
      <img
        src={`${import.meta.env.BASE_URL}logo.svg`}
        alt="ReYoGo"
        className="size-16 opacity-50"
        draggable={false}
      />
      <div className="flex flex-col items-center gap-2 text-center max-w-lg">
        <span className="text-base font-semibold text-foreground">Failed to start ReYoGo</span>
        <span className="text-sm text-muted-foreground">
          The database could not be initialized. {hint}
        </span>
        <code className="mt-2 rounded bg-muted px-3 py-2 text-xs text-muted-foreground break-all">
          {error}
        </code>
      </div>
    </div>
  );
}
