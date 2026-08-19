import type { IStocktakeSession } from '@reyogo/types';

export type StocktakeSessionSelectProps = {
  sessions: IStocktakeSession[];
  value: string | undefined;
  onChange: (sessionId: string | undefined) => void;
};
