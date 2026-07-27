import { useEffect } from 'react';
import type { UseAvailableOptionsSyncArgs } from './types';

export function useAvailableOptionsSync({
  availableCategories,
  availableTypes,
  onAvailableCategoriesChange,
  onAvailableTypesChange,
}: UseAvailableOptionsSyncArgs) {
  useEffect(() => {
    onAvailableCategoriesChange(availableCategories);
  }, [availableCategories, onAvailableCategoriesChange]);

  useEffect(() => {
    onAvailableTypesChange(availableTypes);
  }, [availableTypes, onAvailableTypesChange]);
}
