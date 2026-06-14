import { CogsTotalHint } from './components/CogsTotalHint';
import { cogsTotalLabel } from './utils/cogsTotalLabel';
import type { CogsTotalCardProps } from './types';

export function CogsTotalCard({ cogs }: CogsTotalCardProps) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Total COGS
      </p>
      <p className="mt-1 font-mono text-2xl font-semibold text-foreground">
        {cogsTotalLabel(cogs)}
      </p>
      <CogsTotalHint cogs={cogs} />
    </div>
  );
}
