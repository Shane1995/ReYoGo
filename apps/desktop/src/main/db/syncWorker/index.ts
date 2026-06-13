import { createReplicaClient } from '@reyogo/db';

type SyncCredentials = {
  replicaPath: string;
  syncUrl: string;
  authToken: string;
};

type SyncResult = { success: true } | { success: false; error: string };

const REQUIRED_CREDENTIAL_FIELDS = ['replicaPath', 'syncUrl', 'authToken'] as const;

function hasStringField(record: Record<string, unknown>, key: string): boolean {
  return typeof record[key] === 'string';
}

function isCredentials(data: unknown): data is SyncCredentials {
  if (typeof data !== 'object') return false;
  if (data === null) return false;
  const record = data as Record<string, unknown>;
  return REQUIRED_CREDENTIAL_FIELDS.every((key) => hasStringField(record, key));
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

  let handle: ReturnType<typeof createReplicaClient>;
  try {
    handle = createReplicaClient(replicaPath, syncUrl, authToken);
  } catch (err: unknown) {
    process.parentPort.postMessage({
      success: false,
      error: err instanceof Error ? err.message : String(err),
    } satisfies SyncResult);
    return;
  }

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
