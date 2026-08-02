import type { DisplayConfidence } from './types';

export const COST_DECIMALS = 4;

export const CONFIDENCE_LABEL: Record<DisplayConfidence, string> = {
  high: 'High confidence',
  medium: 'Medium confidence',
  low: 'Low confidence',
  needsReview: 'Needs review',
};

export const CONFIDENCE_BADGE_CLASS: Record<DisplayConfidence, string> = {
  high: 'border-emerald-300 text-emerald-700 dark:border-emerald-700/60 dark:text-emerald-400',
  medium: 'border-amber-300 text-amber-700 dark:border-amber-700/60 dark:text-amber-400',
  low: 'border-destructive/40 text-destructive',
  needsReview: 'border-amber-300 text-amber-700 dark:border-amber-700/60 dark:text-amber-400',
};
