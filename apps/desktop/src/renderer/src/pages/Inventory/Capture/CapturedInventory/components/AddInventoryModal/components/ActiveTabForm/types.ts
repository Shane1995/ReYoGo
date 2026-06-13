import type { Tab } from '../../constants';

export type ActiveTabFormProps = {
  activeTab: Tab;
  onDone: (label: string) => void;
};
