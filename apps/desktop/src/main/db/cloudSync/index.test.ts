import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('electron', () => ({
  app: { getPath: vi.fn(() => '/tmp/test-userdata'), isPackaged: false },
  safeStorage: {
    isEncryptionAvailable: vi.fn(() => true),
    encryptString: vi.fn((s: string) => Buffer.from(`enc:${s}`)),
    decryptString: vi.fn((b: Buffer) => b.toString().replace('enc:', '')),
  },
  BrowserWindow: { getAllWindows: vi.fn(() => []) },
}));

vi.mock('electron-store', () => {
  const store: Record<string, unknown> = {};
  const MockStore = vi.fn(function () {
    return {
      get: (key: string, def?: unknown) => store[key] ?? def,
      set: (key: string, val: unknown) => {
        store[key] = val;
      },
      delete: (key: string) => {
        delete store[key];
      },
    };
  });
  return { default: MockStore };
});

vi.mock('fs', () => ({
  default: { existsSync: vi.fn(() => false) },
  existsSync: vi.fn(() => false),
}));

import { hasCloudCredentials, clearCredentials, getSyncStatus } from './index';
import { SyncState } from '@shared/types/cloudSync';

describe('hasCloudCredentials', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns false when no credentials stored', () => {
    expect(hasCloudCredentials()).toBe(false);
  });
});

describe('getSyncStatus', () => {
  it('returns idle state with no lastSyncedAt initially', () => {
    const status = getSyncStatus();
    expect(status.state).toBe(SyncState.Idle);
    expect(status.lastSyncedAt).toBeNull();
    expect(status.error).toBeNull();
  });
});

describe('clearCredentials', () => {
  it('can be called without throwing', () => {
    expect(() => clearCredentials()).not.toThrow();
  });
});
