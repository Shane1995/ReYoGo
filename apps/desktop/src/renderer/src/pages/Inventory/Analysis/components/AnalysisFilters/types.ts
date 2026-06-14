export type FiltersProps = {
  search: string;
  filterType: string;
  filterCategory: string;
  fromDate: string;
  toDate: string;
  availableTypes: string[];
  availableCategories: string[];
  hasFilters: boolean;
  setSearch: (v: string) => void;
  setFilterType: (v: string) => void;
  setFilterCategory: (v: string) => void;
  setFromDate: (v: string) => void;
  setToDate: (v: string) => void;
  clearFilters: () => void;
};
