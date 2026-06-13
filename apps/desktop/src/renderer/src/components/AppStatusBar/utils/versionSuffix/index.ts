import type { AppVersionInfo } from '@/services/app';

export function versionSuffix(syncing: boolean, version: AppVersionInfo | null): string {
  if (syncing) return '';
  if (!version) return '';
  return ` · v${version.version}`;
}
