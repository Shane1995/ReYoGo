import type { ItemGroup } from '../../types';

export type Section = {
  type: string;
  groups: ItemGroup[];
};

export type SummaryTableViewProps = {
  groups: ItemGroup[];
};
