import type { IStocktakeSession } from '@reyogo/types';

export type SessionPickerProps = {
  sessions: IStocktakeSession[];
  currentSessionId: string | undefined;
  onSelect: (id: string) => void;
  onCreate: () => void;
};
