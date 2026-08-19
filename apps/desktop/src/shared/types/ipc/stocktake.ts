export const StocktakeIPC = {
  CREATE_SESSION: 'stocktake:create-session',
  GET_SESSIONS: 'stocktake:get-sessions',
  GET_SESSION: 'stocktake:get-session',
  SAVE_DRAFT_LINES: 'stocktake:save-draft-lines',
  COMPLETE_SESSION: 'stocktake:complete-session',
} as const;

export type StocktakeIPC = (typeof StocktakeIPC)[keyof typeof StocktakeIPC];
