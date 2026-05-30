import { CloudSyncStage } from '@shared/types/cloudSync';

export const STAGE_LABEL: Record<CloudSyncStage, string> = {
  [CloudSyncStage.Migrating]: 'Applying schema to cloud…',
  [CloudSyncStage.Pushing]: 'Uploading your data…',
  [CloudSyncStage.Verifying]: 'Verifying data integrity…',
  [CloudSyncStage.Activating]: 'Activating cloud sync…',
  [CloudSyncStage.Syncing]: 'Syncing…',
};
