import type { ItemOption } from '../types';

export type UseItemAutocompleteParams = {
  items: ItemOption[];
  value: string;
  entityId: string;
  onChange: (itemId: string) => void;
  onSelectComplete?: () => void;
  onNavigateRight?: () => void;
};

export type OpenKeyActions = Record<string, (() => void) | undefined>;
