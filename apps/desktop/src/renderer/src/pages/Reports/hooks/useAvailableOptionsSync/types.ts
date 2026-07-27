export type UseAvailableOptionsSyncArgs = {
  availableCategories: string[];
  availableTypes: string[];
  onAvailableCategoriesChange: (categories: string[]) => void;
  onAvailableTypesChange: (types: string[]) => void;
};
