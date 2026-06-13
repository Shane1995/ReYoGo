import type { Mode } from '../../types';

export type ModeTabBarProps = {
  mode: Mode;
  onSelect: (mode: Mode) => void;
};
