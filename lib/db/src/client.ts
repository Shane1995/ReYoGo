import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

function makeDbClient(url: string, authToken?: string) {
  const client = createClient({ url, authToken });
  return drizzle(client, { schema });
}

export type DbClient = ReturnType<typeof makeDbClient>;

export type DbHandle = { db: DbClient; close: () => void };
export type ReplicaHandle = { db: DbClient; sync: () => Promise<void>; close: () => void };

export function createDbClient(url: string, authToken?: string): DbHandle {
  const client = createClient({ url, authToken });
  return { db: drizzle(client, { schema }), close: () => client.close() };
}

const BACKGROUND_SYNC_INTERVAL_SECONDS = 5 * 60;

export function createReplicaClient(
  replicaPath: string,
  syncUrl: string,
  authToken: string,
): ReplicaHandle {
  const client = createClient({
    url: `file:${replicaPath}`,
    syncUrl,
    authToken,
    offline: true,
    syncInterval: BACKGROUND_SYNC_INTERVAL_SECONDS,
  });
  return {
    db: drizzle(client, { schema }),
    sync: () => client.sync().then(() => undefined),
    close: () => client.close(),
  };
}
