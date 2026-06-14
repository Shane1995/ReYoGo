import type { ItemGroup } from '../../../types';

export type AnalysisCategoryRowProps = {
  catName: string;
  catGroups: ItemGroup[];
  isExpanded: boolean;
  onToggle: () => void;
};
