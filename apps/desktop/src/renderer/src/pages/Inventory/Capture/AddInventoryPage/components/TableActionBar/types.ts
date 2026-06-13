import type { Mode } from '../../types';

export type TableActionBarProps = {
  mode: Mode;
  hasIncompleteItemRows: boolean;
  canSubmitItems: boolean;
  canSubmitCats: boolean;
  onAddRow: () => void;
  onClear: () => void;
  onSubmit: () => void;
};
