import { describe, it, expect, vi } from 'vitest';

vi.mock('../../db', () => ({
  getLocalDbPath: vi.fn(() => '/tmp/test.db'),
  getReplicaPath: vi.fn(() => '/tmp/replica.db'),
  reinitialise: vi.fn(),
}));

vi.mock('../../db/cloudSync', () => ({
  activateCloudSync: vi.fn(),
  getSyncStatus: vi.fn(() => ({ state: 'idle', lastSyncedAt: null, error: null })),
  getStoredCredentials: vi.fn(() => null),
  getTursoUrl: vi.fn(() => null),
  hasCloudCredentials: vi.fn(() => false),
  deleteLocalBackup: vi.fn(),
  recordSyncSuccess: vi.fn(),
  recordSyncError: vi.fn(),
  withSyncTimeout: vi.fn((p: Promise<unknown>) => p),
}));

vi.mock('electron', () => ({ ipcMain: { handle: vi.fn() } }));
vi.mock('better-sqlite3', () => ({
  default: vi.fn(() => ({ close: vi.fn(), prepare: vi.fn(() => ({ all: vi.fn(() => []) })) })),
}));

import { registerSettingsHandlers } from './index';

describe('registerSettingsHandlers', () => {
  it('registers without throwing', () => {
    expect(() => registerSettingsHandlers()).not.toThrow();
  });
});
