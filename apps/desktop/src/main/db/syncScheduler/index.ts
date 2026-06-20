import { net } from 'electron';
import { isReplicaMode, getReplicaPath, syncViaUtilityProcess } from '../index';
import { getStoredCredentials, recordSyncSuccess, recordSyncError } from '../cloudSync';

const DEBOUNCE_MS = 3_000;
const CONNECTIVITY_POLL_MS = 30_000;

let _timer: ReturnType<typeof setTimeout> | null = null;
let _poller: ReturnType<typeof setInterval> | null = null;
let _wasOffline = false;

export function withSync<T>(op: () => Promise<T>): Promise<T> {
  return op().then((result) => {
    scheduleDebouncedSync();
    return result;
  });
}

export function scheduleDebouncedSync(): void {
  if (!isReplicaMode()) return;
  if (_timer !== null) clearTimeout(_timer);
  _timer = setTimeout(() => {
    _timer = null;
    const credentials = getStoredCredentials();
    if (!credentials) return;
    syncViaUtilityProcess(getReplicaPath(), credentials.tursoUrl, credentials.authToken)
      .then(() => {
        recordSyncSuccess();
      })
      .catch((err: unknown) => {
        recordSyncError(err instanceof Error ? err.message : String(err));
      });
  }, DEBOUNCE_MS);
}

export function cancelPendingSync(): void {
  if (_timer !== null) {
    clearTimeout(_timer);
    _timer = null;
  }
}

export function startConnectivityPoller(): void {
  if (_poller !== null) return;
  _wasOffline = !net.isOnline();
  _poller = setInterval(() => {
    const online = net.isOnline();
    if (!online) {
      _wasOffline = true;
      return;
    }
    if (_wasOffline) {
      _wasOffline = false;
      scheduleDebouncedSync();
    }
  }, CONNECTIVITY_POLL_MS);
}

export function stopConnectivityPoller(): void {
  if (_poller !== null) {
    clearInterval(_poller);
    _poller = null;
  }
}

export function _resetForTest(): void {
  cancelPendingSync();
  stopConnectivityPoller();
  _wasOffline = false;
}
