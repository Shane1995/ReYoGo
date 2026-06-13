export const MIGRATION_ERROR_PATTERNS = [
  /cannot add a not null column/i,
  /NOT NULL constraint/i,
  /migration/i,
];

export const CLOUD_ERROR_PATTERNS = [
  /onedrive|dropbox|icloud|google drive|synced/i,
  /readonly|read-only|EROFS|EPERM/i,
];
