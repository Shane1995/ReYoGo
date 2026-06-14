import type { CogsTotalHintProps } from './types';

export function CogsTotalHint({ cogs }: CogsTotalHintProps) {
  if (cogs?.total) return null;
  return (
    <p className="mt-1 text-xs text-muted-foreground">
      COGS populates when stock OUT movements are recorded.
    </p>
  );
}
