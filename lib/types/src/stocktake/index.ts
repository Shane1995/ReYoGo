export type StocktakeSessionStatus = 'open' | 'complete';

export interface IStocktakeSession {
  id: string;
  accountId: string;
  label: string | null;
  status: StocktakeSessionStatus;
  completedAt: Date | null;
  createdAt: Date;
}

export interface IStocktakeLine {
  id: string;
  sessionId: string;
  inventoryItemId: string;
  countedQty: number;
  notes: string | null;
}

export interface IStocktakeSessionWithLines extends IStocktakeSession {
  lines: IStocktakeLine[];
}

export interface ISaveStocktakeLinePayload {
  id: string;
  inventoryItemId: string;
  countedQty: number;
  notes?: string | null;
}

export interface ICompleteStocktakePayload {
  sessionId: string;
  lines: ISaveStocktakeLinePayload[];
}
