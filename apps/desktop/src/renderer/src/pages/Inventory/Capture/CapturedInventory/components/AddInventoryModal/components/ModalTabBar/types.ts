import type { Tab } from '../../constants';

export type ModalTabBarProps = {
  activeTab: Tab;
  onSelect: (t: Tab) => void;
};
