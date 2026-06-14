import type { ItemGroup } from '../../../../types';
import type { ToggleFn, NavigateFn } from '../../types';

export type GroupRowProps = {
  group: ItemGroup;
  index: number;
  expanded: Set<string>;
  toggle: ToggleFn;
  navigate: NavigateFn;
};
