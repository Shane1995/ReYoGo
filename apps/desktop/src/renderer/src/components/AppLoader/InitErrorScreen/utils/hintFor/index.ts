import { MIGRATION_ERROR_PATTERNS, CLOUD_ERROR_PATTERNS } from '../../constants';

function matchesAny(error: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(error));
}

export function hintFor(error: string): string {
  if (matchesAny(error, MIGRATION_ERROR_PATTERNS)) {
    return 'A database schema update failed. If you are upgrading from an older version, try deleting the app data folder and relaunching.';
  }
  if (matchesAny(error, CLOUD_ERROR_PATTERNS)) {
    return 'If this app is installed inside a OneDrive or cloud-synced folder, try moving it to a local folder (e.g. Desktop or C:\\Program Files).';
  }
  return 'Try relaunching the app. If the problem persists, reinstall or contact support.';
}
