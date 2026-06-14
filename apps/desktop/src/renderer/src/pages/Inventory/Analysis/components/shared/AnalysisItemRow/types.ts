import type { ItemGroup } from '../../../types';

export type AnalysisItemRowProps = {
  group: ItemGroup;
  rowIndex?: number;
  onNavigate: (itemId: string) => void;
};
