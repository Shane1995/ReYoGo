import type { FiltersProps } from '../../types';

export type FilterSelectsProps = Pick<
  FiltersProps,
  | 'filterType'
  | 'filterCategory'
  | 'availableTypes'
  | 'availableCategories'
  | 'setFilterType'
  | 'setFilterCategory'
>;
