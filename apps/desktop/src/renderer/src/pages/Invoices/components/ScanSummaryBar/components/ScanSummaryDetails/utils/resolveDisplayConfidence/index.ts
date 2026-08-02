import type { ScanConfidence } from '@reyogo/types';
import type { DisplayConfidence } from '../../../../types';

export function resolveDisplayConfidence(
  confidence: ScanConfidence,
  hasWarnings: boolean,
): DisplayConfidence {
  if (hasWarnings) return 'needsReview';
  return confidence;
}
