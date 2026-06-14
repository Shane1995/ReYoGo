import { TabView } from './components/TabView';
import type { AnalysisContentProps } from './types';

export function AnalysisContent({ loading, lines, analysisTab, groups }: AnalysisContentProps) {
  if (loading) {
    return <p className="text-sm text-muted-foreground/60">Loading…</p>;
  }
  if (lines.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--nav-border)] bg-muted/10 p-10 text-center text-sm text-muted-foreground/60">
        No captured invoices yet. Save invoices from Capture Invoice to see analysis here.
      </div>
    );
  }
  return <TabView analysisTab={analysisTab} groups={groups} />;
}
