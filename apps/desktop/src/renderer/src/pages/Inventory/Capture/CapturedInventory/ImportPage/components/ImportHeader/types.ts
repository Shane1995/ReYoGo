import type { PageState } from '../../types';

export type ImportHeaderProps = {
  phase: PageState['phase'];
  entityName?: string;
  onDownloadTemplate: () => void;
  onChooseDifferentFile: () => void;
};
