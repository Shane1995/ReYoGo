export const SetupIPC = {
  GET_UNITS: 'setup:get-units',
  UPSERT_UNIT: 'setup:upsert-unit',
  DELETE_UNIT: 'setup:delete-unit',
} as const;

export type SetupIPC = (typeof SetupIPC)[keyof typeof SetupIPC];
