import { CloudSyncEventType } from '@shared/types/cloudSync';

export const ICON_TRANSITION = { duration: 0.15 };

export const SPIN_TRANSITION = {
  rotate: { repeat: Infinity, duration: 1, ease: 'linear' as const },
  opacity: ICON_TRANSITION,
  scale: ICON_TRANSITION,
};

export const REFRESH_EVENT_TYPES: CloudSyncEventType[] = [
  CloudSyncEventType.Success,
  CloudSyncEventType.BackgroundSync,
  CloudSyncEventType.Error,
];
