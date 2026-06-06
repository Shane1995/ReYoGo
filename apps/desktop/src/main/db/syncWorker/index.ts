import { createReplicaClient } from '@reyogo/db';

type SyncCredentials = {
  replicaPath: string;
  syncUrl: string;
  authToken: string;
};

type SyncResult = { success: true } | { success: false; error: string };

function isCredentials(data: unknown): data is SyncCredentials {
  if (typeof data !== 'object' || data === null) return false;
  const record = data as Record<string, unknown>;
  return (
    typeof record.replicaPath === 'string' &&
    typeof record.syncUrl === 'string' &&
    typeof record.authToken === 'string'
  );
}

process.parentPort.once('message', ({ data }: Electron.MessageEvent) => {
  if (!isCredentials(data)) {
    process.parentPort.postMessage({
      success: false,
      error: 'Invalid sync credentials',
    } satisfies SyncResult);
    return;
  }

  const { replicaPath, syncUrl, authToken } = data;
  const handle = createReplicaClient(replicaPath, syncUrl, authToken);

  handle
    .sync()
    .then(() => {
      process.parentPort.postMessage({ success: true } satisfies SyncResult);
    })
    .catch((err: unknown) => {
      process.parentPort.postMessage({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      } satisfies SyncResult);
    })
    .finally(() => {
      handle.close();
    });
});
