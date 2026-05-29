export const SetupIPC = {
  GET_UNITS: 'setup:get-units',
  UPSERT_UNIT: 'setup:upsert-unit',
  DELETE_UNIT: 'setup:delete-unit',
  ARCHIVE_UNIT: 'setup:archive-unit',
  RESTORE_UNIT: 'setup:restore-unit',
  HARD_DELETE_UNIT: 'setup:hard-delete-unit',
  GET_UNIT_USAGE_COUNT: 'setup:get-unit-usage-count',
  GET_ARCHIVED_UNITS: 'setup:get-archived-units',
} as const;

export type SetupIPC = (typeof SetupIPC)[keyof typeof SetupIPC];
