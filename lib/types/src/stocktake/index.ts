export type StocktakeSessionStatus = 'open' | 'complete';

export interface StocktakeSession {
  id: string;
  accountId: string;
  label: string | null;
  status: StocktakeSessionStatus;
  completedAt: Date | null;
  createdAt: Date;
}

export interface StocktakeLine {
  id: string;
  sessionId: string;
  inventoryItemId: string;
  countedQty: number;
  notes: string | null;
}

export interface StocktakeSessionWithLines extends StocktakeSession {
  lines: StocktakeLine[];
}

export interface SaveStocktakeLinePayload {
  id: string;
  inventoryItemId: string;
  countedQty: number;
  notes?: string | null;
}

export interface CompleteStocktakePayload {
  sessionId: string;
  lines: SaveStocktakeLinePayload[];
}

export type IStocktakeSession = StocktakeSession;
export type IStocktakeLine = StocktakeLine;
export type IStocktakeSessionWithLines = StocktakeSessionWithLines;
export type ISaveStocktakeLinePayload = SaveStocktakeLinePayload;
export type ICompleteStocktakePayload = CompleteStocktakePayload;
