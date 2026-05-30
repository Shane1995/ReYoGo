import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

export function createDbClient(url: string, authToken?: string) {
  const client = createClient({ url, authToken });
  return drizzle(client, { schema });
}

export type DbClient = ReturnType<typeof createDbClient>;

export function createReplicaClient(
  replicaPath: string,
  syncUrl: string,
  authToken: string,
): { db: DbClient; sync: () => Promise<void> } {
  const client = createClient({ url: `file:${replicaPath}`, syncUrl, authToken });
  return { db: drizzle(client, { schema }), sync: () => client.sync().then(() => undefined) };
}
