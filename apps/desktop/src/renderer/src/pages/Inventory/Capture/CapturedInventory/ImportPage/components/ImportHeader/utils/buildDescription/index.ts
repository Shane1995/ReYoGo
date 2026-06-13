import type { PageState } from '../../../../types';

export function buildDescription(phase: PageState['phase'], entityName?: string): string {
  if (phase === 'review') {
    return `Review what will be added to ${entityName ?? 'your business'}, then click commit.`;
  }
  const suffix = entityName ? ` for ${entityName}` : '';
  return `Upload an Excel or CSV file to bulk-add units, categories and items${suffix}.`;
}
