import { app } from 'electron';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

type StoreSchema = {
  'cloudSync.tursoUrl': string;
  'cloudSync.authTokenEncrypted': string;
  'cloudSync.lastSyncedAt': string;
  'cloudSync.syncError': string;
};

type StoreKey = keyof StoreSchema;

function getStorePath(): string {
  return join(app.getPath('userData'), 'cloud-sync-store.json');
}

function read(): Partial<StoreSchema> {
  const path = getStorePath();
  if (!existsSync(path)) return {};
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as Partial<StoreSchema>;
  } catch {
    return {};
  }
}

function write(data: Partial<StoreSchema>): void {
  const path = getStorePath();
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
}

export const store = {
  get<K extends StoreKey>(key: K): StoreSchema[K] | undefined {
    return read()[key];
  },
  set<K extends StoreKey>(key: K, value: StoreSchema[K]): void {
    write({ ...read(), [key]: value });
  },
  delete(key: StoreKey): void {
    const data = read();
    delete data[key];
    write(data);
  },
};
